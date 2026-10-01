import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Film, Loader2 } from 'lucide-react';
import AutoplayOverlay from './AutoplayOverlay';
import SubtitlesOverlay from '../room/SubtitlesOverlay';

export default function LocalVideoPlayer({ 
  videoUrl, 
  title = '',
  volume = 1.0, 
  isMuted = false, 
  playbackRate = 1.0,
  aspectRatio = 'contain',
  subtitleCues = [],
  isSubtitlesVisible = true,
  onTimeUpdate = () => {},
  onDurationChange = () => {},
  videoRef: externalVideoRef
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

  const internalVideoRef = useRef(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const isInternalSyncRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [needsAutoplayUnlock, setNeedsAutoplayUnlock] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const DRIFT_TOLERANCE_SECONDS = 0.5;

  // Calculate room authoritative current time accounting for elapsed playback
  const getExpectedCurrentTime = useCallback(() => {
    let target = playback?.currentTime || 0;
    if (playback?.isPlaying && playback?.lastUpdatedAt) {
      const elapsed = (Date.now() - playback.lastUpdatedAt) / 1000;
      target += elapsed;
    }
    return Math.max(0, target);
  }, [playback]);

  // Initial source load and late-joining sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setLoadError(null);
    setNeedsAutoplayUnlock(false);

    // If readyState is already loaded enough
    if (video.readyState >= 2) {
      setIsLoading(false);
      setIsBuffering(false);
    } else {
      setIsLoading(true);
    }

    const handleLoadedData = () => {
      setIsLoading(false);
      setIsBuffering(false);
      const targetTime = getExpectedCurrentTime();
      if (targetTime > 0 && Number.isFinite(targetTime)) {
        try {
          video.currentTime = targetTime;
        } catch (e) {}
      }

      if (playback?.isPlaying) {
        isInternalSyncRef.current = true;
        video.play().catch(err => {
          console.warn('[LocalVideoPlayer] Autoplay was prevented by browser:', err);
          setNeedsAutoplayUnlock(true);
        }).finally(() => {
          setTimeout(() => { isInternalSyncRef.current = false; }, 300);
        });
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoUrl, getExpectedCurrentTime, playback?.isPlaying]);

  // Socket playback changes synchronization (Play / Pause / Seek)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || isLoading) return;

    try {
      isInternalSyncRef.current = true;

      const targetTime = getExpectedCurrentTime();
      const currentVideoTime = video.currentTime || 0;
      const drift = Math.abs(currentVideoTime - targetTime);

      // Drift correction
      if (drift > DRIFT_TOLERANCE_SECONDS && Number.isFinite(targetTime)) {
        setSyncStatus('syncing');
        video.currentTime = targetTime;
        setTimeout(() => setSyncStatus('synced'), 300);
      }

      // Play/Pause sync
      if (playback?.isPlaying && video.paused) {
        video.play().then(() => {
          setIsBuffering(false);
        }).catch(err => {
          console.warn('[LocalVideoPlayer] Play blocked:', err);
          setNeedsAutoplayUnlock(true);
        });
      } else if (!playback?.isPlaying && !video.paused) {
        video.pause();
        setIsBuffering(false);
      }
    } catch (err) {
      console.warn('[LocalVideoPlayer] Sync error:', err);
    } finally {
      setTimeout(() => {
        isInternalSyncRef.current = false;
      }, 300);
    }
  }, [playback?.isPlaying, playback?.currentTime, playback?.lastUpdatedAt, isLoading, getExpectedCurrentTime, setSyncStatus, videoUrl]);

  // Volume & Mute Sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Playback Rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Periodic Drift Check (every 2.5s)
  useEffect(() => {
    if (!playback?.isPlaying || isLoading) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;

      const targetTime = getExpectedCurrentTime();
      const current = video.currentTime;
      const drift = Math.abs(current - targetTime);

      if (drift > 1.0 && Number.isFinite(targetTime)) {
        isInternalSyncRef.current = true;
        video.currentTime = targetTime;
        setTimeout(() => {
          isInternalSyncRef.current = false;
        }, 300);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [playback?.isPlaying, isLoading, getExpectedCurrentTime]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const time = video.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
      if (isBuffering) setIsBuffering(false);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      const dur = video.duration || 0;
      setDuration(dur);
      onDurationChange(dur);
      setIsLoading(false);
      setIsBuffering(false);
    }
  };

  const handleVideoError = (e) => {
    console.warn('[LocalVideoPlayer] Video element error:', e);
    setLoadError('Failed to load video file. Check format or connection.');
    setIsLoading(false);
    setIsBuffering(false);
  };

  const handleUnlockAutoplay = () => {
    setNeedsAutoplayUnlock(false);
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      const targetTime = getExpectedCurrentTime();
      if (targetTime > 0) video.currentTime = targetTime;
      video.play().then(() => {
        setIsBuffering(false);
      }).catch(e => console.warn('Unlock failed:', e));
    }
  };

  const objectFitClass = aspectRatio === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {loadError ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-watchmate-error/15 border border-watchmate-error/30 flex items-center justify-center text-watchmate-error mb-3 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-watchmate-text mb-1">Video Stream Error</h4>
          <p className="text-xs text-watchmate-secondaryText mb-4 leading-relaxed">{loadError}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => { setIsLoading(false); setIsBuffering(false); }}
            onCanPlay={() => { setIsLoading(false); setIsBuffering(false); }}
            onPlaying={() => { setIsLoading(false); setIsBuffering(false); }}
            onPlay={() => { setIsBuffering(false); }}
            onPause={() => { setIsBuffering(false); }}
            onSeeked={() => { setIsBuffering(false); }}
            onWaiting={() => { if (playback?.isPlaying) setIsBuffering(true); }}
            onError={handleVideoError}
            className={`w-full h-full ${objectFitClass}`}
          />

          {/* Subtitles Overlay */}
          {subtitleCues && subtitleCues.length > 0 && (
            <SubtitlesOverlay 
              cues={subtitleCues}
              currentTime={currentTime}
              isVisible={isSubtitlesVisible}
            />
          )}

          {/* Subtle non-blocking spinner only when genuinely waiting for data while playback is active */}
          {isBuffering && playback?.isPlaying && (
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-watchmate-cyan shadow-lg">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Buffering...</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Autoplay Unlock Modal */}
      {needsAutoplayUnlock && (
        <AutoplayOverlay onUnlock={handleUnlockAutoplay} message="Tap to join synchronized video" />
      )}
    </div>
  );
}
