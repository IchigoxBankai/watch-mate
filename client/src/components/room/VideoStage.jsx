import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Play, 
  Pause, 
  AlertCircle, 
  Tv, 
  Video, 
  Monitor, 
  Subtitles, 
  Sparkles,
  Upload,
  Search,
  Compass,
  HardDrive,
  Crown
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { FloatingReactionsOverlay } from './ReactionLayer';
import PlaybackControls from './PlaybackControls';
import VideoContentPicker from './VideoContentPicker';
import YouTubeStage from './YouTubeStage';
import NetflixStage from './NetflixStage';
import ScreenShareStage from './ScreenShareStage';
import SubtitlesOverlay from './SubtitlesOverlay';
import CountdownOverlay from './CountdownOverlay';

export default function VideoStage() {
  const { 
    room,
    participants,
    currentVideo, 
    playback, 
    isSyncingRef, 
    emitPlay, 
    emitPause, 
    emitSeek, 
    emitPlaybackRate,
    setSyncStatus,
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

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const idleTimeoutRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [centerAnimation, setCenterAnimation] = useState(null); // 'play' | 'pause'
  const [subtitleCues, setSubtitleCues] = useState([]);
  const [isSubtitlesVisible, setIsSubtitlesVisible] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  // Guest local video file state
  const [guestLocalFileUrl, setGuestLocalFileUrl] = useState(null);

  const SYNC_TOLERANCE = 0.35;

  // Reset video error and guest local file whenever video source changes
  useEffect(() => {
    setVideoError(null);
    setGuestLocalFileUrl(null);
  }, [currentVideo?.id]);

  // Determine active video URL and host status
  const isHost = room?.hostId === currentUser?.id;
  const isHostOwner = currentVideo?.ownerId === currentUser?.id;
  const isBlobUrl = currentVideo?.url?.startsWith('blob:');
  const needsLocalFile = currentVideo?.type === 'local' && isBlobUrl && !isHost && !guestLocalFileUrl;
  const activeVideoUrl = guestLocalFileUrl || currentVideo?.url;

  // Handle Synchronized Playback for HTML5 direct / local video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo || currentVideo.type === 'youtube' || currentVideo.type === 'netflix' || currentVideo.type === 'screen_share' || needsLocalFile) return;

    if (playback.isPlaying && video.paused) {
      video.play().catch(e => {
        console.warn('[VideoStage] Auto-play was blocked or waiting for user interaction:', e);
      });
    } else if (!playback.isPlaying && !video.paused) {
      video.pause();
    }

    let targetTime = playback.currentTime || 0;
    if (playback.isPlaying && playback.lastUpdatedAt) {
      const elapsed = (Date.now() - playback.lastUpdatedAt) / 1000;
      targetTime += elapsed;
    }

    const drift = Math.abs(video.currentTime - targetTime);
    if (drift > SYNC_TOLERANCE) {
      setSyncStatus('syncing');
      video.currentTime = targetTime;
      setTimeout(() => {
        setSyncStatus('synced');
      }, 400);
    }
  }, [playback, currentVideo, needsLocalFile, setSyncStatus]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setVideoError(null);
    }
  };

  const handleVideoError = (e) => {
    // Only show error if an accessible video is actually loaded
    if (currentVideo && activeVideoUrl && !needsLocalFile) {
      console.warn('[VideoStage] Video error event:', e);
      setVideoError("We couldn't load this video stream. Try another source or check the URL.");
    }
  };

  const handleGuestLocalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setGuestLocalFileUrl(fileUrl);
    setVideoError(null);
    showToast(`Loaded local copy: ${file.name}`, 'success');
  };

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

  const handleMouseMove = () => {
    setShowControls(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (playback.isPlaying) {
      idleTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const getVideoObjectFitClass = () => {
    if (aspectRatio === 'cover') return 'object-cover';
    return 'object-contain';
  };

  return (
    <>
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playback.isPlaying && setShowControls(false)}
        className={`relative w-full ${
          currentVideo && !needsLocalFile ? 'aspect-video' : 'min-h-[360px] sm:min-h-[400px] aspect-auto sm:aspect-video'
        } bg-[#050C16] rounded-3xl overflow-hidden border border-watchmate-border shadow-[0_0_50px_-10px_rgba(37,99,235,0.25)] group flex items-center justify-center select-none`}
      >
        {/* Floating Reactions Layer */}
        <FloatingReactionsOverlay />

        {/* Global Synchronized Countdown Overlay */}
        <CountdownOverlay 
          countdownData={countdownState} 
          onComplete={() => setCountdownState(null)} 
        />

        {/* Render Stage based on source type */}
        {(() => {
          if (currentVideo?.type === 'youtube') {
            return (
              <YouTubeStage 
                youtubeId={currentVideo.youtubeId || currentVideo.id}
                volume={volume}
                isMuted={isMuted}
                playbackRate={playbackRate}
              />
            );
          }

          if (currentVideo?.type === 'netflix') {
            return (
              <NetflixStage 
                onStartScreenShare={startScreenShare}
              />
            );
          }

          if (currentVideo?.type === 'screen_share') {
            return (
              <ScreenShareStage 
                stream={screenStream}
                isSharing={isScreenSharing}
                onStopSharing={stopScreenShare}
                volume={volume}
                isMuted={isMuted}
              />
            );
          }

          /* Local Video Guest Companion: When host loaded a local file and guest hasn't loaded their local copy yet */
          if (currentVideo?.type === 'local' && needsLocalFile) {
            return (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-md my-auto">
                <div className="w-14 h-14 rounded-2xl bg-watchmate-online/15 border border-watchmate-online/30 flex items-center justify-center text-watchmate-online mb-3 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
                  <Film className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-watchmate-online/15 border border-watchmate-online/30 text-watchmate-online text-[10px] font-bold uppercase tracking-wider mb-2">
                  Local Movie Sync Mode
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl text-watchmate-text mb-1 line-clamp-1">
                  {currentVideo.title}
                </h3>
                <p className="text-xs text-watchmate-secondaryText mb-5 leading-relaxed">
                  The host loaded a local movie file. Select your copy of this video on your device to sync playback in 100% full HD with zero buffering.
                </p>

                <label className="btn-primary px-6 py-3 rounded-2xl text-xs font-bold cursor-pointer shadow-xl flex items-center gap-2 mb-3 hover:scale-105 active:scale-95 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Select Video File on this Device</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleGuestLocalFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-1.5 text-[11px] text-watchmate-muted">
                  <span>Don't have the file?</span>
                  <button 
                    onClick={() => openContentPicker('screen')} 
                    className="text-watchmate-cyan hover:underline font-semibold"
                  >
                    Host can Stream Live via Screen Share
                  </button>
                </div>
              </div>
            );
          }

          if (currentVideo) {
            return (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeVideoUrl}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleVideoError}
                  onClick={handlePlayPause}
                  className={`w-full h-full ${getVideoObjectFitClass()} cursor-pointer`}
                />

                {/* Subtitles Overlay */}
                <SubtitlesOverlay 
                  cues={subtitleCues}
                  currentTime={currentTime}
                  isVisible={isSubtitlesVisible}
                />
              </div>
            );
          }

          /* Premium Empty Stage State */
          if (!isHost) {
            const hostParticipant = participants?.find(p => p.id === room?.hostId);
            const hostDisplayName = hostParticipant ? hostParticipant.name : 'The Room Host';

            return (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-md w-full my-auto">
                <div className="w-14 h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                  <Tv className="w-7 h-7 animate-pulse" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-watchmate-elevated border border-watchmate-border text-xs text-watchmate-secondaryText mb-3">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Host: <strong className="text-watchmate-text">{hostDisplayName}</strong></span>
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-watchmate-text mb-1.5">
                  Waiting for Stream
                </h3>
                <p className="text-xs text-watchmate-secondaryText leading-relaxed max-w-sm">
                  {hostDisplayName} is choosing a stream or video. When they start playing, it will appear here in real-time sync.
                </p>
              </div>
            );
          }

          /* Host Stream Launcher (Mobile Optimized) */
          return (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center max-w-xl w-full my-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-2 sm:mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-display font-bold text-lg sm:text-2xl text-watchmate-text mb-1">
                Choose Your Stream
              </h3>
              <p className="text-[11px] sm:text-xs text-watchmate-secondaryText mb-4 sm:mb-6 max-w-md px-2 leading-relaxed">
                As the room host, select a streaming source to broadcast and watch synchronously with everyone.
              </p>

              {/* Quick Stream Launcher Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full mb-4">
                {/* 1. YouTube */}
                <button
                  onClick={() => openContentPicker('youtube')}
                  className="p-2.5 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-red-950/30 border border-watchmate-border hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-watchmate-text group-hover:text-red-400">YouTube</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted">Search & Live</span>
                  </div>
                </button>

                {/* 2. Netflix Party */}
                <button
                  onClick={() => openContentPicker('netflix')}
                  className="p-2.5 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-red-950/30 border border-watchmate-border hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-watchmate-text group-hover:text-red-400">Netflix</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted">Party Sync</span>
                  </div>
                </button>

                {/* 3. Local Movie */}
                <button
                  onClick={() => openContentPicker('upload')}
                  className="p-2.5 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-watchmate-online/15 border border-watchmate-online/30 flex items-center justify-center text-watchmate-online group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-watchmate-text group-hover:text-watchmate-cyan">Local Video</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted">Gallery / MKV</span>
                  </div>
                </button>

                {/* 4. Screen Share */}
                <button
                  onClick={() => openContentPicker('screen')}
                  className="p-2.5 sm:p-3.5 rounded-2xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 group transition-all transform hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-watchmate-cyan/15 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan group-hover:scale-110 transition-transform">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-watchmate-text group-hover:text-watchmate-cyan">Screen Share</span>
                    <span className="text-[9px] sm:text-[10px] text-watchmate-muted">Tab + Audio</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => openContentPicker('youtube')}
                className="btn-primary px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Open Full Stream Library
              </button>
            </div>
          );
        })()}

        {/* Video Load Error Overlay (only shown if an accessible video failed) */}
        {videoError && currentVideo && !needsLocalFile && (
          <div className="absolute inset-0 bg-[#07111F]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-10 h-10 text-watchmate-error mb-2" />
            <p className="text-sm font-semibold text-watchmate-text mb-4">{videoError}</p>
            {isHost && (
              <button
                onClick={() => { setVideoError(null); openContentPicker('youtube'); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-watchmate-surface border border-watchmate-border hover:bg-watchmate-elevated text-watchmate-text"
              >
                Choose Another Stream
              </button>
            )}
          </div>
        )}

        {/* Center Animated Play/Pause feedback icon */}
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

        {/* Floating Top Bar (Title, Change Stream button, Subtitles) for all stream modes */}
        {currentVideo && (
          <div className={`absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-20 transition-opacity duration-300 flex items-center justify-between pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2 pointer-events-auto min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#07111F]/85 backdrop-blur-md border border-watchmate-border text-[11px] sm:text-xs text-watchmate-text font-medium max-w-[180px] xs:max-w-[240px] sm:max-w-md truncate shadow-lg">
                {currentVideo.type === 'youtube' ? (
                  <Video className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-500 shrink-0" />
                ) : currentVideo.type === 'netflix' ? (
                  <Tv className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-500 shrink-0" />
                ) : currentVideo.type === 'local' ? (
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-online shrink-0" />
                ) : currentVideo.type === 'screen_share' ? (
                  <Monitor className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan shrink-0" />
                ) : (
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan shrink-0" />
                )}
                <span className="truncate">{currentVideo.title}</span>
              </div>

              {/* Subtitle Status Tag */}
              {subtitleCues.length > 0 && currentVideo.type === 'local' && (
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

            {/* Change Stream Quick Action Button (Host Only) */}
            {isHost && (
              <div className="flex items-center gap-2 pointer-events-auto shrink-0">
                <button
                  onClick={() => openContentPicker(currentVideo.type || 'youtube')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#07111F]/85 hover:bg-watchmate-surface backdrop-blur-md border border-watchmate-border hover:border-watchmate-cyan/50 text-white text-[11px] sm:text-xs font-semibold shadow-lg transition-all"
                  title="Change Video / Stream Source"
                >
                  <Film className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan" />
                  <span className="hidden xs:inline">Change Stream</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Playback Controls Overlay (bottom) for Local / Direct MP4 */}
        {currentVideo && currentVideo.type !== 'youtube' && currentVideo.type !== 'netflix' && currentVideo.type !== 'screen_share' && !needsLocalFile && (
          <div className={`absolute bottom-0 inset-x-0 z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <PlaybackControls
              isPlaying={playback.isPlaying}
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

      {/* Video Content Picker Modal */}
      <VideoContentPicker
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
