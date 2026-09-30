import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRoom } from '../../context/RoomContext';
import { Play, Pause, AlertCircle } from 'lucide-react';

export default function YouTubeStage({ youtubeId, volume, isMuted, playbackRate }) {
  const { 
    playback, 
    emitPlay, 
    emitPause, 
    emitSeek, 
    setSyncStatus,
    showToast 
  } = useRoom();

  const playerRef = useRef(null);
  const containerId = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`);
  const isInternalChangeRef = useRef(false);
  const isApiLoadedRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [apiError, setApiError] = useState(null);

  const SYNC_TOLERANCE = 0.5;

  // Load YouTube IFrame API script tag once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isApiLoadedRef.current = true;
      initPlayer();
      return;
    }

    const existingTag = document.getElementById('youtube-iframe-api-script');
    if (!existingTag) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const prevOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevOnYouTubeIframeAPIReady) prevOnYouTubeIframeAPIReady();
      isApiLoadedRef.current = true;
      initPlayer();
    };

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('YT destroy error:', e);
        }
      }
    };
  }, [youtubeId]);

  const initPlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player || !youtubeId) return;

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('YT reinit destroy error:', e);
      }
    }

    try {
      playerRef.current = new window.YT.Player(containerId.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: playback.isPlaying ? 1 : 0,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            setApiError(null);
            
            // Set initial volume & mute
            try {
              event.target.setVolume(volume * 100);
              if (isMuted) event.target.mute();
              else event.target.unMute();

              // Seek to current room playback time
              let targetTime = playback.currentTime || 0;
              if (playback.isPlaying && playback.lastUpdatedAt) {
                const elapsed = (Date.now() - playback.lastUpdatedAt) / 1000;
                targetTime += elapsed;
              }
              if (targetTime > 0) {
                event.target.seekTo(targetTime, true);
              }

              if (playback.isPlaying) {
                event.target.playVideo();
              } else {
                event.target.pauseVideo();
              }
            } catch (err) {
              console.warn('YT onReady sync error:', err);
            }
          },
          onStateChange: (event) => {
            if (isInternalChangeRef.current) return;

            const player = event.target;
            const currentSecs = player.getCurrentTime() || 0;

            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              if (!playback.isPlaying) {
                emitPlay(currentSecs);
              }
            }
            // YT.PlayerState.PAUSED = 2
            else if (event.data === 2) {
              if (playback.isPlaying) {
                emitPause(currentSecs);
              }
            }
          },
          onError: (e) => {
            console.error('YouTube player error:', e.data);
            if (e.data === 101 || e.data === 150) {
              setApiError('This video does not allow embedded playback by the publisher.');
            } else {
              setApiError('Unable to stream this YouTube video. Please try another link.');
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to create YT Player instance:', err);
    }
  }, [youtubeId, volume, isMuted]);

  // React to Room Context Playback changes
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || typeof player.getPlayerState !== 'function') return;

    try {
      isInternalChangeRef.current = true;

      const currentState = player.getPlayerState();
      let targetTime = playback.currentTime || 0;
      if (playback.isPlaying && playback.lastUpdatedAt) {
        const elapsed = (Date.now() - playback.lastUpdatedAt) / 1000;
        targetTime += elapsed;
      }

      const playerTime = player.getCurrentTime() || 0;
      const drift = Math.abs(playerTime - targetTime);

      if (drift > SYNC_TOLERANCE) {
        setSyncStatus('syncing');
        player.seekTo(targetTime, true);
        setTimeout(() => setSyncStatus('synced'), 400);
      }

      if (playback.isPlaying && currentState !== 1 && currentState !== 3) {
        player.playVideo();
      } else if (!playback.isPlaying && currentState === 1) {
        player.pauseVideo();
      }
    } catch (err) {
      console.warn('YouTube sync error:', err);
    } finally {
      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 300);
    }
  }, [playback, isPlayerReady, setSyncStatus]);

  // Volume and Mute updates
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || typeof player.setVolume !== 'function') return;

    try {
      player.setVolume(volume * 100);
      if (isMuted) player.mute();
      else player.unMute();
    } catch (e) {}
  }, [volume, isMuted, isPlayerReady]);

  // Playback Rate
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isPlayerReady || typeof player.setPlaybackRate !== 'function') return;

    try {
      player.setPlaybackRate(playbackRate);
    } catch (e) {}
  }, [playbackRate, isPlayerReady]);

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {apiError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-watchmate-error mb-3 animate-pulse" />
          <h4 className="text-sm font-semibold text-watchmate-text mb-1">Playback Restricted</h4>
          <p className="text-xs text-watchmate-secondaryText mb-4">{apiError}</p>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <div id={containerId.current} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
