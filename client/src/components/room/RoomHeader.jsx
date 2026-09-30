import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Settings, LogOut, Radio, Crown, Film } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';
import SyncIndicator from './SyncIndicator';
import InviteModal from './InviteModal';
import RoomSettingsModal from './RoomSettingsModal';

export default function RoomHeader() {
  const { room, participants, leaveRoom, openContentPicker } = useRoom();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const isHost = room?.hostId === currentUser?.id;

  const handleLeave = () => {
    leaveRoom();
    navigate('/home');
  };

  return (
    <>
      <header className="w-full bg-watchmate-surface/95 backdrop-blur-md border-b border-watchmate-border px-4 py-3 shrink-0 select-none">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand + Room Name + Live Badge */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button onClick={handleLeave} className="shrink-0 hover:opacity-80 transition-opacity">
              <Logo size="sm" showText={false} />
            </button>

            <div className="h-5 w-[1px] bg-watchmate-border hidden sm:block shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg text-watchmate-text truncate">
                {room?.name || 'Watch Lounge'}
              </h1>

              {/* LIVE Badge */}
              <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-watchmate-cyan/10 border border-watchmate-cyan/25 text-watchmate-cyan text-[10px] font-bold tracking-wider uppercase shrink-0">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>LIVE</span>
              </div>

              {isHost && (
                <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] font-semibold shrink-0">
                  <Crown className="w-2.5 h-2.5" />
                  <span>HOST</span>
                </div>
              )}
            </div>
          </div>

          {/* Middle: Synchronization Status */}
          <div className="hidden lg:flex items-center gap-4">
            <SyncIndicator />
          </div>

          {/* Right: Change Stream, Participants counter, Invite, Settings, Leave */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Change Stream Button */}
            <button
              onClick={() => openContentPicker('youtube')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-watchmate-elevated hover:bg-watchmate-surface border border-watchmate-border hover:border-watchmate-cyan/50 text-watchmate-text shadow-sm transition-all"
              title="Change streaming content"
            >
              <Film className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span className="hidden sm:inline">Change Stream</span>
            </button>

            {/* Watchers Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-watchmate-elevated text-xs font-medium text-watchmate-secondaryText border border-watchmate-border">
              <Users className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span className="text-watchmate-text font-semibold">{participants.length}</span>
              <span className="hidden sm:inline">watching</span>
            </div>

            {/* Invite Button with Blue-to-Cyan gradient */}
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invite</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setSettingsModalOpen(true)}
              title="Room Preferences"
              className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-text bg-watchmate-elevated hover:bg-watchmate-elevatedHover border border-watchmate-border transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Leave Room */}
            <button
              onClick={handleLeave}
              title="Leave Room"
              className="p-2 rounded-xl text-watchmate-muted hover:text-watchmate-error bg-watchmate-elevated hover:bg-watchmate-elevatedHover border border-watchmate-border transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        roomId={room?.id || ''}
        roomName={room?.name || ''}
      />

      <RoomSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </>
  );
}
