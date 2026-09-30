import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Tv, 
  Radio, 
  Monitor, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Users,
  Film
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';

export default function NetflixStage({ onStartScreenShare }) {
  const { 
    currentVideo, 
    playback, 
    emitPlay, 
    emitPause, 
    emitSeek, 
    emitCountdown,
    countdownState,
    openContentPicker,
    room 
  } = useRoom();
  const { currentUser } = useAuth();

  const [localSeconds, setLocalSeconds] = useState(playback.currentTime || 0);

  // Sync with room time
  useEffect(() => {
    setLocalSeconds(playback.currentTime || 0);
  }, [playback.currentTime]);

  // If playing, increment local clock timer
  useEffect(() => {
    let interval = null;
    if (playback.isPlaying) {
      interval = setInterval(() => {
        setLocalSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playback.isPlaying]);

  const formatTimestamp = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const padS = s < 10 ? `0${s}` : s;
    if (h > 0) {
      const padM = m < 10 ? `0${m}` : m;
      return `${h}:${padM}:${padS}`;
    }
    return `${m}:${padS}`;
  };

  const netflixWatchUrl = currentVideo?.url || `https://www.netflix.com/watch/${currentVideo?.netflixId || ''}`;

  const handleOpenNetflix = () => {
    // Open Netflix in new tab or popup
    window.open(netflixWatchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTogglePlayPause = () => {
    if (playback.isPlaying) {
      emitPause(localSeconds);
    } else {
      // Trigger synchronized countdown
      emitCountdown({ count: 3, message: 'Play in' });
      setTimeout(() => {
        emitPlay(localSeconds);
      }, 3000);
    }
  };

  const handleQuickJump = (delta) => {
    const nextTime = Math.max(0, localSeconds + delta);
    setLocalSeconds(nextTime);
    emitSeek(nextTime);
  };

  const isHost = room?.hostId === currentUser?.id;

  return (
    <div className="w-full h-full relative bg-[#0B0D14] overflow-hidden flex flex-col justify-between p-4 sm:p-8">
      {/* Background Poster / Atmospheric Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${currentVideo?.thumbnail || 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050C16] via-[#07111F]/80 to-[#07111F]/90 pointer-events-none" />

      {/* Top Header info */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
                NETFLIX PARTY
              </span>
              <span className="text-xs text-watchmate-cyan font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-pulse" />
                Synced Party Mode
              </span>
            </div>
            <h3 className="font-display font-bold text-base sm:text-xl text-white mt-0.5 line-clamp-1">
              {currentVideo?.title || 'Netflix Title'}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openContentPicker('netflix')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border text-white text-xs font-semibold transition-all"
          >
            <Film className="w-3.5 h-3.5 text-watchmate-cyan" />
            <span>Change Video</span>
          </button>

          <button
            onClick={handleOpenNetflix}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all transform hover:scale-105"
          >
            <span>Open on Netflix</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Synchronization Hub & Time Display */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-6 max-w-lg mx-auto">
        {/* Synced Time Clock Display */}
        <div className="px-6 py-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl mb-4 shadow-2xl">
          <div className="text-[11px] font-semibold text-watchmate-muted uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-watchmate-cyan" />
            <span>Master Room Timestamp</span>
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-white tracking-widest text-glow-cyan">
            {formatTimestamp(localSeconds)}
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 text-xs text-watchmate-secondaryText mb-6">
          <CheckCircle2 className="w-4 h-4 text-watchmate-online" />
          <span>All participants synchronized to master playback clock</span>
        </div>

        {/* Main Sync Controls */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          <button
            onClick={() => handleQuickJump(-10)}
            className="p-3 rounded-2xl bg-watchmate-surface/80 hover:bg-watchmate-elevated border border-watchmate-border text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
            <span>-10s</span>
          </button>

          <button
            onClick={handleTogglePlayPause}
            className={`px-6 py-3.5 rounded-2xl font-display font-bold text-sm flex items-center gap-2.5 transition-all shadow-xl ${
              playback.isPlaying
                ? 'bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border text-white'
                : 'btn-primary shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-105'
            }`}
          >
            {playback.isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current text-watchmate-cyan" />
                <span>Pause Party</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current text-white" />
                <span>Sync Play (3s Countdown)</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleQuickJump(10)}
            className="p-3 rounded-2xl bg-watchmate-surface/80 hover:bg-watchmate-elevated border border-watchmate-border text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Forward 10 seconds"
          >
            <span>+10s</span>
            <RotateCcw className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Bottom Screen Share / Tab Stream Quick Option */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs text-watchmate-muted">
          <Sparkles className="w-4 h-4 text-watchmate-gold shrink-0" />
          <span>Friends don't have a Netflix account? Host can stream tab live with audio!</span>
        </div>

        {onStartScreenShare && (
          <button
            onClick={onStartScreenShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-borderLight text-xs font-semibold text-watchmate-text transition-all"
          >
            <Monitor className="w-3.5 h-3.5 text-watchmate-cyan" />
            <span>Stream Netflix Tab (with Audio)</span>
          </button>
        )}
      </div>
    </div>
  );
}
