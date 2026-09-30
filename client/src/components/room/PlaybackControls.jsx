import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw,
  Film,
  Gauge
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { QuickReactionButtons } from './ReactionLayer';

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onOpenContentPicker,
  disabled = false
}) {
  const { room } = useRoom();
  const { currentUser } = useAuth();
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const isHost = room?.hostId === currentUser?.id;
  const isControlRestricted = room?.settings?.hostOnlyControl && !isHost;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
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

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleSeekChange = (e) => {
    if (isControlRestricted) return;
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleSkip = (seconds) => {
    if (isControlRestricted) return;
    const target = Math.max(0, Math.min(currentTime + seconds, duration || 0));
    onSeek(target);
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="w-full select-none bg-gradient-to-t from-[#07111F]/95 via-[#07111F]/75 to-transparent pt-10 pb-4 px-4 sm:px-6 rounded-b-3xl">
      {/* Timeline Scrubber */}
      <div className="relative mb-3.5 group/timeline flex items-center">
        {/* Custom Progress Bar with Blue-to-Cyan Gradient */}
        <div className="absolute inset-x-0 h-1.5 bg-watchmate-border rounded-full overflow-hidden group-hover/timeline:h-2 transition-all">
          <div 
            className="h-full bg-blue-gradient rounded-full transition-all relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Real Slider Control */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime || 0}
          disabled={isControlRestricted || disabled}
          onChange={handleSeekChange}
          className="relative z-10 w-full h-4 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          title={isControlRestricted ? 'Playback controlled by Host' : 'Seek video'}
        />
      </div>

      {/* Control Bar Actions */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Left: Play/Pause, 10s skips, Volume, Time indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onPlayPause}
            disabled={isControlRestricted || disabled}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-watchmate-elevated hover:bg-watchmate-surface text-watchmate-text border border-watchmate-border'
                : 'btn-primary shadow-lg shadow-watchmate-primary/30 scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Quick Skips */}
          <button
            onClick={() => handleSkip(-10)}
            disabled={isControlRestricted}
            className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-elevated transition-colors disabled:opacity-40"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSkip(10)}
            disabled={isControlRestricted}
            className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-elevated transition-colors disabled:opacity-40"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-elevated transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-watchmate-error" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1.5 bg-watchmate-border rounded-full appearance-none transition-all"
              title="Volume"
            />
          </div>

          {/* Time text */}
          <div className="text-xs font-mono text-watchmate-muted ml-1 select-none">
            <span className="text-watchmate-text font-semibold">{formatTime(currentTime)}</span>
            <span className="mx-1 text-watchmate-muted/60">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Middle: Floating Reaction Bar */}
        <div className="hidden md:flex items-center">
          <QuickReactionButtons />
        </div>

        {/* Right: Change Content, Speed, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Change Video Button (Host Only) */}
          {isHost && (
            <button
              onClick={onOpenContentPicker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-watchmate-surface hover:bg-watchmate-elevated text-watchmate-text border border-watchmate-border transition-all"
              title="Change Video Source"
            >
              <Film className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span className="hidden sm:inline">Change Video</span>
            </button>
          )}

          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-watchmate-surface hover:bg-watchmate-elevated text-watchmate-text border border-watchmate-border transition-colors"
              title="Playback Speed"
            >
              <Gauge className="w-3.5 h-3.5 text-watchmate-muted" />
              <span>{playbackRate}x</span>
            </button>

            {speedMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSpeedMenuOpen(false)} />
                <div className="absolute right-0 bottom-full mb-2 w-28 rounded-2xl bg-watchmate-elevated border border-watchmate-border shadow-2xl py-1.5 z-30">
                  {speeds.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange(rate);
                        setSpeedMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        playbackRate === rate
                          ? 'text-watchmate-cyan bg-watchmate-surface font-bold'
                          : 'text-watchmate-text hover:bg-watchmate-surface'
                      }`}
                    >
                      {rate}x {rate === 1.0 ? '(Normal)' : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-text bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
