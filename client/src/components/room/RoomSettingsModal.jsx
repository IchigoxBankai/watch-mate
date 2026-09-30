import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Shield, Mic, Smile, Lock, Crown } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';

export default function RoomSettingsModal({ isOpen, onClose }) {
  const { room, emitUpdateSettings } = useRoom();
  const { currentUser } = useAuth();

  const isHost = room?.hostId === currentUser?.id;

  const [settings, setSettings] = useState(room?.settings || {
    hostOnlyControl: false,
    allowReactions: true,
    voiceChatEnabled: true,
    allowAnyoneWithLink: true
  });

  if (!isOpen) return null;

  const handleToggle = (key) => {
    if (!isHost) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    emitUpdateSettings(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-watchmate-surface border border-watchmate-border rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-watchmate-cyan/15 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-watchmate-text">
                  Room Preferences
                </h3>
                <p className="text-xs text-watchmate-muted">
                  {isHost ? 'Manage host permissions and room behavior' : 'View room settings'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isHost && (
            <div className="mb-4 p-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border flex items-center gap-2.5 text-xs text-watchmate-muted">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Only the room host can alter these playback rules.</span>
            </div>
          )}

          {/* Toggle Switches */}
          <div className="space-y-3 mb-6">
            {/* Host Only Playback */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-elevated border border-watchmate-border">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-watchmate-cyan" />
                <div>
                  <p className="text-sm font-medium text-watchmate-text">Host-only Playback Control</p>
                  <p className="text-xs text-watchmate-muted">Only the host can play, pause, or seek</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!isHost}
                onClick={() => handleToggle('hostOnlyControl')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.hostOnlyControl ? 'bg-watchmate-primary' : 'bg-watchmate-surface border border-watchmate-border'
                } ${!isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.hostOnlyControl ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Voice Chat Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-elevated border border-watchmate-border">
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-watchmate-brightBlue" />
                <div>
                  <p className="text-sm font-medium text-watchmate-text">Live Voice Chat</p>
                  <p className="text-xs text-watchmate-muted">Enable WebRTC voice communication</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!isHost}
                onClick={() => handleToggle('voiceChatEnabled')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.voiceChatEnabled ? 'bg-watchmate-cyan' : 'bg-watchmate-surface border border-watchmate-border'
                } ${!isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.voiceChatEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quick Reactions */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-elevated border border-watchmate-border">
              <div className="flex items-center gap-3">
                <Smile className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-watchmate-text">Floating Reactions</p>
                  <p className="text-xs text-watchmate-muted">Allow members to send live emoji bursts</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!isHost}
                onClick={() => handleToggle('allowReactions')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.allowReactions ? 'bg-amber-400' : 'bg-watchmate-surface border border-watchmate-border'
                } ${!isHost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.allowReactions ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-watchmate-elevated border border-watchmate-border hover:bg-watchmate-surface text-watchmate-text transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
