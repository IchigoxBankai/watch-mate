import React from 'react';
import { Crown, Mic, MicOff, UserX, Volume2, Shield } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';

export default function ParticipantsPanel() {
  const { room, participants, emitKickParticipant } = useRoom();
  const { currentUser } = useAuth();
  const { isSpeakingLocally, speakingUsers, isVoiceConnected, isMuted } = useVoice();

  const isHost = room?.hostId === currentUser?.id;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-full bg-watchmate-surface border border-watchmate-border rounded-3xl p-4 sm:p-5 flex flex-col shadow-card-subtle">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-watchmate-border/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-watchmate-cyan shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
          <h3 className="font-display font-bold text-xs tracking-wider text-watchmate-text uppercase">
            In The Lounge
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-watchmate-elevated text-watchmate-secondaryText border border-watchmate-border">
          {participants.length}
        </span>
      </div>

      {/* Participants List */}
      <div className="space-y-2.5 overflow-y-auto max-h-60 sm:max-h-80 pr-1">
        {participants.length === 0 ? (
          <div className="text-center py-6 text-xs text-watchmate-muted">
            Invite someone and make this room yours.
          </div>
        ) : (
          participants.map((p) => {
            const isMe = p.id === currentUser?.id;
            const isUserSpeaking = isMe ? isSpeakingLocally : speakingUsers.has(p.id);
            const isUserHost = p.id === room?.hostId;

            return (
              <div
                key={p.id}
                className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                  isUserSpeaking
                    ? 'bg-watchmate-cyan/10 border border-watchmate-cyan/40 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]'
                    : 'bg-watchmate-elevated/70 border border-transparent hover:border-watchmate-border'
                }`}
              >
                {/* User Info & Avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {/* Soft blue/cyan speaking pulse ring */}
                    {isUserSpeaking && (
                      <span className="absolute -inset-1 rounded-full border border-watchmate-cyan animate-ping pointer-events-none opacity-70" />
                    )}

                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className={`w-9 h-9 rounded-full object-cover relative z-10 border ${
                          isUserSpeaking ? 'border-watchmate-cyan shadow-[0_0_10px_rgba(56,189,248,0.6)]' : 'border-watchmate-border'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold relative z-10 ${
                          isMe
                            ? 'bg-watchmate-primary/25 text-watchmate-cyan border border-watchmate-cyan/40'
                            : 'bg-watchmate-surface text-watchmate-text border border-watchmate-border'
                        } ${isUserSpeaking ? 'border-watchmate-cyan text-watchmate-cyan shadow-[0_0_10px_rgba(56,189,248,0.6)]' : ''}`}
                      >
                        {getInitials(p.name)}
                      </div>
                    )}

                    {/* Host Mini Badge */}
                    {isUserHost && (
                      <div className="absolute -bottom-1 -right-1 z-20 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                        <Crown className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-xs text-watchmate-text truncate">
                        {p.name}
                      </p>
                      {isMe && (
                        <span className="text-[10px] text-watchmate-muted font-normal">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      {isUserSpeaking ? (
                        <span className="text-watchmate-cyan font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-watchmate-cyan animate-pulse" />
                          Speaking
                        </span>
                      ) : (
                        <span className="text-watchmate-muted">
                          {isMe && isVoiceConnected ? (isMuted ? 'Muted' : 'Listening') : 'In room'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (Kick if host) */}
                <div className="flex items-center gap-1.5">
                  {isHost && !isMe && (
                    <button
                      onClick={() => emitKickParticipant(p.id)}
                      title={`Remove ${p.name}`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-watchmate-muted hover:text-watchmate-error hover:bg-watchmate-surface transition-all"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
