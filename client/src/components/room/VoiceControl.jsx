import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, PhoneCall, AlertCircle, Radio } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useRoom } from '../../context/RoomContext';

export default function VoiceControl() {
  const { 
    isVoiceConnected, 
    isMuted, 
    isDeafened, 
    isSpeakingLocally, 
    voiceError, 
    joinVoice, 
    leaveVoice, 
    toggleMute, 
    toggleDeafen 
  } = useVoice();
  const { room } = useRoom();

  if (room?.settings && room.settings.voiceChatEnabled === false) {
    return (
      <div className="p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border text-center text-xs text-watchmate-muted">
        Voice chat is disabled by the host for this room.
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-borderLight rounded-3xl p-4 sm:p-5 flex flex-col shadow-card-subtle">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isVoiceConnected ? 'bg-watchmate-cyan shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse' : 'bg-watchmate-muted'}`} />
          <h3 className="font-display font-bold text-xs tracking-wider text-watchmate-text uppercase font-mono">
            Spatial Voice Lounge
          </h3>
        </div>

        {isVoiceConnected && (
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-watchmate-cyan/15 text-watchmate-cyan border border-watchmate-cyan/35 flex items-center gap-1 shadow-sm">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            Connected
          </span>
        )}
      </div>

      {voiceError && (
        <div className="mb-3 p-2.5 rounded-xl bg-watchmate-error/15 border border-watchmate-error/30 flex items-center gap-2 text-xs text-watchmate-error font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {!isVoiceConnected ? (
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <p className="text-xs text-watchmate-secondaryText mb-3">
            Talk naturally with friends in real-time while you watch.
          </p>
          <button
            onClick={joinVoice}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold shadow-blue-glow transition-all group hover:scale-[1.02]"
          >
            <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Join Spatial Voice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-watchmate-surface border border-watchmate-border text-xs">
            <span className="text-watchmate-secondaryText font-medium">Status:</span>
            {isSpeakingLocally ? (
              <span className="text-watchmate-cyan font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                🎙 You are speaking
              </span>
            ) : isMuted ? (
              <span className="text-watchmate-error font-semibold">Microphone Muted</span>
            ) : (
              <span className="text-watchmate-gold font-semibold flex items-center gap-1">
                <span>●</span> Listening
              </span>
            )}
          </div>

          {/* Voice Action Controls */}
          <div className="grid grid-cols-3 gap-2">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                isMuted
                  ? 'bg-watchmate-error/15 border-watchmate-error/40 text-watchmate-error'
                  : 'bg-watchmate-surface border-watchmate-border text-watchmate-text hover:border-watchmate-cyan/50 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-watchmate-cyan" />}
              <span className="text-[10px]">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* Deafen Button */}
            <button
              onClick={toggleDeafen}
              className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                isDeafened
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-watchmate-surface border-watchmate-border text-watchmate-text hover:border-watchmate-cyan/50 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              }`}
              title={isDeafened ? 'Undeafen audio' : 'Deafen audio'}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-watchmate-brightBlue" />}
              <span className="text-[10px]">{isDeafened ? 'Undeafen' : 'Deafen'}</span>
            </button>

            {/* Disconnect Button */}
            <button
              onClick={leaveVoice}
              className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl text-xs font-medium bg-watchmate-surface hover:bg-watchmate-error/20 border border-watchmate-border hover:border-watchmate-error/40 text-watchmate-muted hover:text-watchmate-error transition-all"
              title="Leave voice chat"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="text-[10px]">Leave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
