import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Video, RefreshCw } from 'lucide-react';
import AutoplayOverlay from './AutoplayOverlay';

export default function YouTubePlayer({ 
  videoId, 
  volume = 1.0, 
  isMuted = false, 
  playbackRate = 1.0,
  onPlayerReady = () => {},
  onError = () => {}
}) {
  const { 
    room,
    playback, 
    emitPlay, 
    emitPause, 
    emitSeek, 
    setSyncStatus,
    showToast 
  } = useRoom();

  const { currentUser } = useAuth();
  const isHost = room?.hostId === currentUser?.id;

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const containerId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  
  // Guard flags against synchronization feedback loops
  const isInternalSyncRef = useRef(false);
  const isMountedRef = useRef(true);

  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const DRIFT_TOLERANCE_SECONDS = 0.8;

  // Calculate authoritative room playback position accounting for elapsed time
  const getExpectedCurrentTime = useCallback(() => {
    let target = playback?.currentTime || 0;
    if (playback?.isPlaying && playback?.lastUpdatedAt) {
      const elapsed = (Date.now() - playback.lastUpdatedAt) / 1000;
      target += elapsed;
    }
    return Math.max(0, target);
  }, [playback]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    isMountedRef.current = true;

    const loadApi = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') prevReady();
        if (isMountedRef.current) {
          initPlayer();
        }
      };
    };

    loadApi();

    return () => {
      isMountedRef.current = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('[YouTubePlayer] Cleanup error:', e);
        }
      }
    };
  }, [videoId]);

  // Instantiate the YouTube Player
  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player || !videoId || !isMountedRef.current) return;

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (e) {}
    }

    try {
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId,
        playerVars: {
          autoplay: playback?.isPlaying ? 1 : 0,
          controls: isHost ? 1 : 0, // Host gets full native controls; guests follow host
          disablekb: isHost ? 0 : 1,
          enablejsapi: 1,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            if (!isMountedRef.current) return;
            setIsReady(true);
            setErrorMessage(null);
            onPlayerReady(event.target);

            try {
              // Apply volume & mute
              event.target.setVolume(Math.round(volume * 100));
              if (isMuted) event.target.mute();
              else event.target.unMute();

              // Late-joining time sync
              const targetTime = getExpectedCurrentTime();
              if (targetTime > 0) {
                event.target.seekTo(targetTime, true);
              }

              if (playback?.isPlaying) {
                const playPromise = event.target.playVideo();
                // Check if browser blocked unmuted autoplay
                setTimeout(() => {
                  const state = event.target.getPlayerState();
                  if (state !== 1 && state !== 3) {
                    setNeedsUserInteraction(true);
                  }
                }, 800);
              } else {
                event.target.pauseVideo();
              }
            } catch (err) {
              console.warn('[YouTubePlayer] onReady setup error:', err);
            }
          },
          onStateChange: (event) => {
            // Guard: If this state change was initiated by an internal sync event, ignore
            if (isInternalSyncRef.current) return;

            const player = event.target;
            const currentSecs = player.getCurrentTime ? player.getCurrentTime() : 0;

            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              setNeedsUserInteraction(false);
              if (isHost && !playback?.isPlaying) {
                emitPlay(currentSecs);
              }
            } 
            // YT.PlayerState.PAUSED = 2
            else if (event.data === 2) {
              if (isHost && playback?.isPlaying) {
                emitPause(currentSecs);
              }
            }
            // YT.PlayerState.ENDED = 0
            else if (event.data === 0) {
              if (isHost) {
                emitPause(currentSecs);
              }
            }
          },
          onError: (e) => {
            console.error('[YouTubePlayer] Error code:', e.data);
            let msg = 'Unable to load this YouTube video.';
            if (e.data === 101 || e.data === 150) {
              msg = 'This YouTube video cannot be embedded by request of the video owner.';
            } else if (e.data === 2) {
              msg = 'Invalid YouTube URL or Video ID.';
            } else if (e.data === 5) {
              msg = 'HTML5 player error on YouTube stream.';
            }
            setErrorMessage(msg);
            onError(msg);
          }
        }
      });
    } catch (err) {
      console.error('[YouTubePlayer] Initialization failed:', err);
      setErrorMessage('Failed to initialize YouTube player.');
    }
  }, [videoId, isHost, volume, isMuted, getExpectedCurrentTime, onPlayerReady, onError, emitPlay, emitPause, playback]);

  // Synchronize playback state changes from Socket (Play / Pause / Seek)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady || typeof player.getPlayerState !== 'function') return;

    try {
      isInternalSyncRef.current = true;

      const currentState = player.getPlayerState();
      const targetTime = getExpectedCurrentTime();
      const playerTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const drift = Math.abs(playerTime - targetTime);

      // Seek if drift exceeds tolerance
      if (drift > DRIFT_TOLERANCE_SECONDS) {
        setSyncStatus('syncing');
        player.seekTo(targetTime, true);
        setTimeout(() => setSyncStatus('synced'), 400);
      }

      // Sync play/pause state
      if (playback?.isPlaying && currentState !== 1 && currentState !== 3) {
        player.playVideo();
      } else if (!playback?.isPlaying && currentState === 1) {
        player.pauseVideo();
      }
    } catch (err) {
      console.warn('[YouTubePlayer] Sync error:', err);
    } finally {
      setTimeout(() => {
        isInternalSyncRef.current = false;
      }, 350);
    }
  }, [playback?.isPlaying, playback?.currentTime, playback?.lastUpdatedAt, isReady, getExpectedCurrentTime, setSyncStatus]);

  // Volume & Mute Updates
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady || typeof player.setVolume !== 'function') return;

    try {
      player.setVolume(Math.round(volume * 100));
      if (isMuted) player.mute();
      else player.unMute();
    } catch (e) {}
  }, [volume, isMuted, isReady]);

  // Playback Rate
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady || typeof player.setPlaybackRate !== 'function') return;

    try {
      player.setPlaybackRate(playbackRate);
    } catch (e) {}
  }, [playbackRate, isReady]);

  // Periodic Drift Correction (every 2 seconds)
  useEffect(() => {
    if (!isReady || !playback?.isPlaying) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;

      try {
        const targetTime = getExpectedCurrentTime();
        const playerTime = player.getCurrentTime();
        const drift = Math.abs(playerTime - targetTime);

        if (drift > 1.2) {
          isInternalSyncRef.current = true;
          player.seekTo(targetTime, true);
          setTimeout(() => {
            isInternalSyncRef.current = false;
          }, 300);
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(interval);
  }, [isReady, playback?.isPlaying, getExpectedCurrentTime]);

  const handleUnlockAutoplay = () => {
    setNeedsUserInteraction(false);
    const player = playerRef.current;
    if (player && typeof player.playVideo === 'function') {
      try {
        player.unMute();
        player.playVideo();
        const targetTime = getExpectedCurrentTime();
        if (targetTime > 0) {
          player.seekTo(targetTime, true);
        }
      } catch (e) {}
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-watchmate-text mb-1">YouTube Playback Restricted</h4>
          <p className="text-xs text-watchmate-secondaryText mb-4 leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => { setErrorMessage(null); initPlayer(); }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border text-watchmate-text flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <div id={containerId.current} className="w-full h-full absolute inset-0" />
        </div>
      )}

      {/* Autoplay Unlock Overlay */}
      {needsUserInteraction && (
        <AutoplayOverlay onUnlock={handleUnlockAutoplay} message="Tap to join YouTube playback" />
      )}
    </div>
  );
}
