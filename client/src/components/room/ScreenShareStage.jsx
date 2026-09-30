import React, { useRef, useEffect } from 'react';
import { Monitor, StopCircle, Volume2, AlertCircle, Film } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useStream } from '../../context/StreamContext';

export default function ScreenShareStage({ stream, isSharing, onStopSharing, volume = 1.0, isMuted = false }) {
  const videoRef = useRef(null);
  const { openContentPicker } = useRoom();
  const { remoteStream } = useStream();

  const activeStream = stream || remoteStream;

  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.play().catch(e => {
        console.warn('Screen share autoplay error:', e);
      });
    }
  }, [activeStream]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Floating Screen Share Badge, Change Source, & Stop button */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-watchmate-cyan/40 text-xs font-semibold text-watchmate-cyan shadow-lg">
              <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-pulse" />
              <span>LIVE Screen Stream</span>
            </div>

            <button
              onClick={() => openContentPicker('screen')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-watchmate-surface backdrop-blur-md border border-watchmate-border text-white text-xs font-semibold transition-all shadow-lg"
            >
              <Film className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span>Change Source</span>
            </button>

            {isSharing && (
              <button
                onClick={onStopSharing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-watchmate-error/80 hover:bg-watchmate-error text-white text-xs font-bold transition-all shadow-lg"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Sharing</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Monitor className="w-12 h-12 text-watchmate-cyan mb-3 animate-pulse" />
          <h4 className="text-sm font-semibold text-white mb-1">Waiting for Screen Stream</h4>
          <p className="text-xs text-watchmate-secondaryText max-w-xs">
            The host is sharing their browser tab or screen. Make sure tab audio is enabled when prompted.
          </p>
        </div>
      )}
    </div>
  );
}
