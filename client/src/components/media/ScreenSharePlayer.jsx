import React, { useRef, useEffect, useState } from 'react';
import { Monitor, StopCircle, Volume2, VolumeX, AlertCircle, Film, Radio, Maximize, Minimize } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useStream } from '../../context/StreamContext';

export default function ScreenSharePlayer({ 
  stream, 
  isSharing, 
  onStopSharing, 
  volume = 1.0, 
  isMuted = false,
  isFullscreen = false,
  onToggleFullscreen
}) {
  const videoRef = useRef(null);
  const { openContentPicker } = useRoom();
  const { remoteStream } = useStream();

  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [isGuestMuted, setIsGuestMuted] = useState(false);
  const lastTapRef = useRef(0);

  const activeStream = stream || remoteStream;

  useEffect(() => {
    if (activeStream) {
      const audioTracks = activeStream.getAudioTracks();
      setHasAudioTrack(audioTracks.length > 0);
    } else {
      setHasAudioTrack(false);
    }
  }, [activeStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && activeStream) {
      video.srcObject = activeStream;
      const playVideo = () => {
        video.play().catch(err => {
          console.warn('[ScreenSharePlayer] Autoplay prevented, muting audio to start video frames:', err);
          video.muted = true;
          setIsGuestMuted(true);
          video.play().catch(() => {});
        });
      };
      playVideo();
      video.onloadedmetadata = () => {
        playVideo();
      };
    }
  }, [activeStream]);

  useEffect(() => {
    if (videoRef.current) {
      if (isSharing) {
        videoRef.current.muted = true;
        videoRef.current.volume = 0;
      } else {
        videoRef.current.volume = volume;
        videoRef.current.muted = isMuted || isGuestMuted;
      }
    }
  }, [volume, isMuted, isGuestMuted, isSharing]);

  const handleUnmuteGuest = (e) => {
    e?.stopPropagation();
    if (videoRef.current && !isSharing) {
      videoRef.current.muted = false;
      setIsGuestMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  const handleFullscreenClick = (e) => {
    e?.stopPropagation();
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      const video = videoRef.current;
      if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else if (video?.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      }
    }
  };

  // Double tap to fullscreen on mobile
  const handleTouchEnd = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleFullscreenClick(e);
    }
    lastTapRef.current = now;
  };

  return (
    <div 
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleFullscreenClick}
      className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden"
    >
      {activeStream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            webkit-playsinline="true"
            muted={isSharing || isMuted || isGuestMuted}
            className="w-full h-full object-contain"
          />

          {/* Floating Top Screen Share HUD */}
          <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Audio Capability Status */}
            <div className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md border text-[10px] sm:text-xs font-semibold shadow-lg ${
              hasAudioTrack 
                ? 'bg-emerald-950/85 border-emerald-500/40 text-emerald-300' 
                : 'bg-black/75 border-white/15 text-watchmate-muted'
            }`}>
              {hasAudioTrack ? <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400" /> : <VolumeX className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-muted" />}
              <span>{hasAudioTrack ? (isSharing ? 'Sharing tab audio' : 'Screen audio ON') : 'No audio'}</span>
            </div>

            {/* Fullscreen / Maximize Button */}
            <button
              onClick={handleFullscreenClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/80 hover:bg-watchmate-surface backdrop-blur-md border border-watchmate-cyan/40 hover:border-watchmate-cyan text-white text-[10px] sm:text-xs font-semibold transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Maximize to Fullscreen'}
              data-no-toggle="true"
            >
              {isFullscreen ? (
                <Minimize className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan" />
              ) : (
                <Maximize className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-watchmate-cyan" />
              )}
              <span>{isFullscreen ? 'Exit' : 'Full Screen'}</span>
            </button>

            {/* Stop Sharing Button (Host only) */}
            {isSharing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStopSharing();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-watchmate-error/90 hover:bg-watchmate-error text-white text-[10px] sm:text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                data-no-toggle="true"
              >
                <StopCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Guest Unmute Audio Banner if muted by browser autoplay policy */}
          {!isSharing && isGuestMuted && (
            <button
              onClick={handleUnmuteGuest}
              className="absolute bottom-4 z-30 px-4 py-2 rounded-full bg-watchmate-primary/95 hover:bg-watchmate-primary text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce cursor-pointer backdrop-blur-md"
              data-no-toggle="true"
            >
              <Volume2 className="w-4 h-4" />
              <span>Tap to Unmute Audio</span>
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-md my-auto">
          <div className="w-14 h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Monitor className="w-7 h-7 animate-pulse" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-watchmate-cyan/15 border border-watchmate-cyan/30 text-watchmate-cyan text-[10px] font-bold uppercase tracking-wider mb-2">
            Live Screen Broadcast
          </span>
          <h4 className="font-display font-bold text-lg text-watchmate-text mb-1">
            Waiting for Screen Stream
          </h4>
          <p className="text-xs text-watchmate-secondaryText max-w-xs leading-relaxed mb-4">
            The room host is sharing their browser tab or desktop screen. The stream will appear here in real-time.
          </p>
          <div className="flex items-center gap-2 text-xs text-watchmate-cyan font-medium">
            <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-ping" />
            <span>Connecting WebRTC stream...</span>
          </div>
        </div>
      )}
    </div>
  );
}
