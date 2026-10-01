import React, { useRef, useEffect, useState } from 'react';
import { Monitor, StopCircle, Volume2, VolumeX, AlertCircle, Film, Radio } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useStream } from '../../context/StreamContext';

export default function ScreenSharePlayer({ 
  stream, 
  isSharing, 
  onStopSharing, 
  volume = 1.0, 
  isMuted = false 
}) {
  const videoRef = useRef(null);
  const { openContentPicker } = useRoom();
  const { remoteStream } = useStream();

  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [isGuestMuted, setIsGuestMuted] = useState(false);

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
      video.play().catch(err => {
        console.warn('[ScreenSharePlayer] Autoplay prevented, muting audio to start video frames:', err);
        video.muted = true;
        setIsGuestMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [activeStream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted || isGuestMuted;
    }
  }, [volume, isMuted, isGuestMuted]);

  const handleUnmuteGuest = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsGuestMuted(false);
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {activeStream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Floating Top Screen Share HUD */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex items-center gap-2">
            {/* Audio Capability Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-[11px] sm:text-xs font-semibold shadow-lg ${
              hasAudioTrack 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                : 'bg-black/70 border-white/10 text-watchmate-muted'
            }`}>
              {hasAudioTrack ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-watchmate-muted" />}
              <span>{hasAudioTrack ? 'Screen sharing with audio' : 'Screen sharing without audio'}</span>
            </div>

            {/* Stop Sharing Button (Host only) */}
            {isSharing && (
              <button
                onClick={onStopSharing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-watchmate-error/90 hover:bg-watchmate-error text-white text-xs font-bold transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Sharing</span>
              </button>
            )}
          </div>

          {/* Guest Unmute Audio Banner if muted by browser autoplay policy */}
          {isGuestMuted && (
            <button
              onClick={handleUnmuteGuest}
              className="absolute bottom-4 z-30 px-4 py-2 rounded-full bg-watchmate-primary/95 hover:bg-watchmate-primary text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce cursor-pointer backdrop-blur-md"
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
