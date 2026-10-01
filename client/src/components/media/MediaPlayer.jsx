import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Tv, 
  Video, 
  Monitor, 
  Upload, 
  Compass,
  Crown,
  Play,
  Pause
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { useStream } from '../../context/StreamContext';
import { FloatingReactionsOverlay } from '../room/ReactionLayer';
import CountdownOverlay from '../room/CountdownOverlay';
import PlaybackControls from '../room/PlaybackControls';
import YouTubePlayer from './YouTubePlayer';
import LocalVideoPlayer from './LocalVideoPlayer';
import ScreenSharePlayer from './ScreenSharePlayer';
import MediaSelector from './MediaSelector';

export default function MediaPlayer() {
  const { 
    room,
    participants,
    currentVideo, 
    playback, 
    emitPlay, 
    emitPause, 
    emitSeek, 
    emitPlaybackRate,
    countdownState,
    setCountdownState,
    screenStream,
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    isContentPickerOpen,
    pickerInitialTab,
    openContentPicker,
    closeContentPicker,
    showToast
  } = useRoom();

  const { currentUser } = useAuth();
  const { startBroadcast, stopBroadcast } = useStream();
  const isHost = room?.hostId === currentUser?.id;

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [centerAnimation, setCenterAnimation] = useState(null); // 'play' | 'pause'
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [isSubtitlesVisible, setIsSubtitlesVisible] = useState(true);

  // Automatically broadcast Screen Share stream via WebRTC to all guests
  useEffect(() => {
    if (isScreenSharing && screenStream && isHost) {
      startBroadcast(screenStream, 'screen', currentVideo?.title || 'Screen Share');
    } else if (!isScreenSharing && isHost) {
      stopBroadcast();
    }
  }, [isScreenSharing, screenStream, isHost, startBroadcast, stopBroadcast, currentVideo?.title]);

  // Play / Pause toggle for local video
  const handlePlayPause = useCallback(() => {
    if (currentVideo?.type === 'youtube') {
      if (playback.isPlaying) {
        emitPause(currentTime);
      } else {
        emitPlay(currentTime);
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        emitPlay(video.currentTime);
        setCenterAnimation('play');
        setTimeout(() => setCenterAnimation(null), 800);
      }).catch(err => console.warn('Play error:', err));
    } else {
      video.pause();
      emitPause(video.currentTime);
      setCenterAnimation('pause');
      setTimeout(() => setCenterAnimation(null), 800);
    }
  }, [currentVideo, playback.isPlaying, currentTime, emitPlay, emitPause]);

  const handleSeek = useCallback((newTime) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    emitSeek(newTime);
  }, [emitSeek]);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    emitPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleToggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto-hide controls during playback after 3.5 seconds
  useEffect(() => {
    if (playback?.isPlaying) {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    } else {
      setShowControls(true);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    }
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [playback?.isPlaying]);

  // Activity handler (mouse move, touch)
  const handleUserActivity = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    setShowControls(true);
    if (playback?.isPlaying) {
      idleTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Screen click/tap toggles controls visibility
  const handleContainerClick = (e) => {
    // If the click/tap is on any interactive element (buttons, scrubber, speed picker), don't toggle
    if (e?.target?.closest('button, input, select, textarea, a, [role="button"], [data-no-toggle]')) {
      return;
    }

    setShowControls((prev) => {
      const next = !prev;
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (next && playback?.isPlaying) {
        idleTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3500);
      }
      return next;
    });
  };

  const sourceType = currentVideo?.type;

  return (
    <>
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleUserActivity}
        onTouchStart={handleUserActivity}
        onMouseLeave={() => playback?.isPlaying && setShowControls(false)}
        className={`relative w-full ${
          currentVideo 
            ? 'aspect-video min-h-[220px] sm:min-h-[360px] md:min-h-[460px]' 
            : 'min-h-[280px] sm:min-h-[380px] aspect-auto sm:aspect-video'
        } bg-[#050C16] rounded-3xl overflow-hidden border border-watchmate-border shadow-[0_0_50px_-10px_rgba(37,99,235,0.25)] group flex items-center justify-center select-none cursor-default`}
      >
        {/* Floating Reactions Layer */}
        <FloatingReactionsOverlay />

        {/* Global Synchronized Countdown Overlay */}
        <CountdownOverlay 
          countdownData={countdownState} 
          onComplete={() => setCountdownState(null)} 
        />

        {/* Dynamic Source Rendering */}
        {(() => {
          // 1. YouTube Player
          if (sourceType === 'youtube') {
            const ytId = currentVideo.youtubeId || currentVideo.id;
            return (
              <YouTubePlayer 
                videoId={ytId}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
              />
            );
          }

          // 2. Local Video Player / Direct MP4
          if (sourceType === 'local' || sourceType === 'direct') {
            return (
              <LocalVideoPlayer 
                videoUrl={currentVideo.url}
                title={currentVideo.title}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
                subtitleCues={subtitleCues}
                isSubtitlesVisible={isSubtitlesVisible}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
                videoRef={videoRef}
              />
            );
          }

          // 3. Screen Share Player
          if (sourceType === 'screen' || sourceType === 'screen_share') {
            return (
              <ScreenSharePlayer 
                stream={screenStream}
                isSharing={isScreenSharing}
                onStopSharing={stopScreenShare}
                volume={volume}
                isMuted={isMuted}
              />
            );
          }

          // 4. Empty State: Guest waiting
          if (!isHost) {
            const hostParticipant = participants?.find(p => p.id === room?.hostId);
            const hostDisplayName = hostParticipant ? hostParticipant.name : 'The Room Host';

            return (
              <div className="flex flex-col items-center justify-center p-5 sm:p-6 text-center max-w-md w-full my-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-2.5 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                  <Tv className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-watchmate-elevated border border-watchmate-border text-xs text-watchmate-secondaryText mb-2.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Host: <strong className="text-watchmate-text">{hostDisplayName}</strong></span>
                </div>
                <h3 className="font-display font-bold text-base sm:text-xl text-watchmate-text mb-1">
                  Waiting for Stream
                </h3>
                <p className="text-[11px] sm:text-xs text-watchmate-secondaryText leading-relaxed max-w-sm">
                  {hostDisplayName} is choosing media to watch. When they start playback, it will synchronize here in real-time.
                </p>
              </div>
            );
          }

          // 5. Empty State: Host launcher (Mobile optimized)
          return (
            <div className="flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-8 text-center max-w-xl w-full my-auto">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-2 sm:mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                <Compass className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-display font-bold text-base sm:text-2xl text-watchmate-text mb-1">
                Choose Media to Watch
              </h3>
              <p className="text-[11px] sm:text-xs text-watchmate-secondaryText mb-3 sm:mb-5 max-w-md px-2 leading-relaxed">
                Select a media source to stream synchronously across all participants in your room.
              </p>

              {/* Quick Stream Launcher Cards - 3 columns on all screen sizes */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mb-3 sm:mb-4">
                {/* 1. YouTube */}
                <button
                  onClick={() => openContentPicker('youtube')}
                  className="p-2 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-red-950/30 border border-watchmate-border hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] sm:text-xs font-bold text-watchmate-text group-hover:text-red-400">YouTube</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted hidden xs:inline">Search & URL</span>
                  </div>
                </button>

                {/* 2. Local Video */}
                <button
                  onClick={() => openContentPicker('upload')}
                  className="p-2 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-watchmate-online/15 border border-watchmate-online/30 flex items-center justify-center text-watchmate-online group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] sm:text-xs font-bold text-watchmate-text group-hover:text-watchmate-cyan">Local Video</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted hidden xs:inline">Upload Movie</span>
                  </div>
                </button>

                {/* 3. Screen Share */}
                <button
                  onClick={() => openContentPicker('screen')}
                  className="p-2 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-watchmate-cyan/15 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan group-hover:scale-110 transition-transform">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] sm:text-xs font-bold text-watchmate-text group-hover:text-watchmate-cyan">Screen Share</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted hidden xs:inline">Tab + Audio</span>
                  </div>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Center Animated Play/Pause Feedback Icon */}
        <AnimatePresence>
          {centerAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.4 }}
              className="absolute pointer-events-none z-20 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl"
            >
              {centerAnimation === 'play' ? (
                <Play className="w-8 h-8 fill-current ml-1 text-watchmate-cyan" />
              ) : (
                <Pause className="w-8 h-8 fill-current text-watchmate-primary" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Top Bar (Title, Source Badge, Change Stream button) */}
        {currentVideo && (
          <div className={`absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-20 transition-opacity duration-300 flex items-center justify-between pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2 pointer-events-auto min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#07111F]/85 backdrop-blur-md border border-watchmate-border text-[11px] sm:text-xs text-watchmate-text font-medium max-w-[200px] xs:max-w-[280px] sm:max-w-md truncate shadow-lg">
                {sourceType === 'youtube' ? (
                  <Video className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-500 shrink-0" />
                ) : sourceType === 'local' || sourceType === 'direct' ? (
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-online shrink-0" />
                ) : sourceType === 'screen' || sourceType === 'screen_share' ? (
                  <Monitor className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan shrink-0" />
                ) : (
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan shrink-0" />
                )}
                <span className="truncate">{currentVideo.title}</span>
              </div>

              {/* Subtitle Toggle Tag */}
              {subtitleCues.length > 0 && (sourceType === 'local' || sourceType === 'direct') && (
                <button
                  onClick={() => setIsSubtitlesVisible(!isSubtitlesVisible)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold border backdrop-blur-md transition-all ${
                    isSubtitlesVisible
                      ? 'bg-watchmate-gold/20 text-watchmate-gold border-watchmate-gold/40'
                      : 'bg-black/60 text-watchmate-muted border-white/10'
                  }`}
                  title="Toggle Subtitles"
                >
                  CC {isSubtitlesVisible ? 'ON' : 'OFF'}
                </button>
              )}
            </div>

            {/* Change Media Button (Host Only) */}
            {isHost && (
              <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                <button
                  onClick={() => openContentPicker(currentVideo.type || 'youtube')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#07111F]/85 hover:bg-watchmate-surface backdrop-blur-md border border-watchmate-border hover:border-watchmate-cyan/50 text-white text-[11px] sm:text-xs font-semibold shadow-lg transition-all cursor-pointer"
                  title="Change Media Source"
                >
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan" />
                  <span className="hidden xs:inline">Change Media</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playback Controls Overlay (bottom) for Local / Direct MP4 */}
        {currentVideo && (sourceType === 'local' || sourceType === 'direct') && (
          <div className={`absolute bottom-0 inset-x-0 z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <PlaybackControls
              isPlaying={playback?.isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              isFullscreen={isFullscreen}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onPlaybackRateChange={handlePlaybackRateChange}
              onToggleFullscreen={handleToggleFullscreen}
              onOpenContentPicker={() => openContentPicker('upload')}
            />
          </div>
        )}
      </div>

      {/* Synchronized Playback Status & Start Button Placed Cleanly BELOW Video Screen */}
      {currentVideo && !playback?.isPlaying && (sourceType === 'youtube' || sourceType === 'local' || sourceType === 'direct') && (
        <div className="w-full mt-3">
          {isHost ? (
            <div className="w-full p-3 sm:p-4 rounded-2xl bg-watchmate-surface/90 border border-watchmate-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-watchmate-cyan/15 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan shrink-0 hidden xs:flex">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs sm:text-sm font-bold text-watchmate-text">Media Ready for Sync</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-watchmate-secondaryText mt-0.5">
                    Click Start Playing to launch synchronized playback for everyone in the room.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  emitPlay(currentTime || 0);
                  setCenterAnimation('play');
                  setTimeout(() => setCenterAnimation(null), 800);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-watchmate-primary to-watchmate-cyan hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Start Playing</span>
              </button>
            </div>
          ) : (
            <div className="w-full p-3 rounded-2xl bg-watchmate-surface/70 border border-watchmate-border flex items-center justify-center sm:justify-start gap-2.5 text-xs text-watchmate-secondaryText shadow-md">
              <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-ping" />
              <span>Media is loaded & ready • Waiting for Host to start playback...</span>
            </div>
          )}
        </div>
      )}

      {/* Media Source Selector Modal */}
      <MediaSelector
        isOpen={isContentPickerOpen}
        initialTab={pickerInitialTab}
        onClose={closeContentPicker}
        onSetSubtitleCues={(cues) => {
          setSubtitleCues(cues);
          showToast(`Loaded ${cues.length} subtitle lines`, 'success');
        }}
      />
    </>
  );
}
