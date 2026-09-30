import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Lock, 
  Globe, 
  Mic, 
  Smile, 
  ArrowRight,
  Tv
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreateRoomPage() {
  const { currentUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState('Friday Anime Night');
  const [isPrivate, setIsPrivate] = useState(true);
  const [allowAnyoneWithLink, setAllowAnyoneWithLink] = useState(true);
  const [hostOnlyControl, setHostOnlyControl] = useState(false);
  const [allowReactions, setAllowReactions] = useState(true);
  const [voiceChatEnabled, setVoiceChatEnabled] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRoomId = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'SYNC-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.toLowerCase();
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setLoading(true);

    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = loginAsGuest(guestName || 'Host');
    }

    const roomId = generateRoomId();

    const roomSettings = {
      isPrivate,
      allowAnyoneWithLink,
      hostOnlyControl,
      allowReactions,
      voiceChatEnabled
    };

    try {
      const stored = JSON.parse(localStorage.getItem('syncora_my_rooms') || '[]');
      const newRoom = {
        id: roomId,
        name: roomName.trim() || `Lounge-${roomId.slice(-4).toUpperCase()}`,
        createdAt: Date.now(),
        settings: roomSettings
      };
      localStorage.setItem('syncora_my_rooms', JSON.stringify([newRoom, ...stored.slice(0, 9)]));
    } catch (e) {
      console.warn('Could not store recent room:', e);
    }

    navigate(`/room/${roomId}`, { 
      state: { 
        roomName: roomName.trim(),
        settings: roomSettings,
        isCreator: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Vibrant Sapphire, Cyan & Gold Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-watchmate-primary/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-watchmate-gold/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(37,99,235,0.25)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/40 flex items-center justify-center text-watchmate-cyan shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-watchmate-text">
              Create a Watch Lounge
            </h1>
            <p className="text-xs text-watchmate-secondaryText">
              Configure your cinema room and invite friends to watch together
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Guest Name if not logged in */}
          {!currentUser && (
            <div className="p-4 rounded-2xl bg-watchmate-surface border border-watchmate-border space-y-2">
              <label className="block text-xs font-semibold text-watchmate-text">
                Your Host Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-watchmate-elevated border border-watchmate-border text-xs text-watchmate-text focus:outline-none focus:border-watchmate-cyan focus:ring-1 focus:ring-watchmate-cyan/40"
              />
            </div>
          )}

          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-watchmate-text mb-2">
              Room Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Friday Anime Night"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-sm text-watchmate-text focus:outline-none focus:ring-1 focus:ring-watchmate-cyan/40"
            />
          </div>

          {/* Room Settings */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-watchmate-cyan uppercase tracking-wider block font-mono">
              Room Permissions & Mode
            </span>

            {/* Anyone with link */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border hover:border-watchmate-borderLight transition-all">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-watchmate-cyan" />
                <div>
                  <p className="text-xs font-semibold text-watchmate-text">Allow anyone with link</p>
                  <p className="text-[11px] text-watchmate-secondaryText">Friends can join instantly using your invite code</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowAnyoneWithLink}
                onChange={(e) => setAllowAnyoneWithLink(e.target.checked)}
                className="w-4 h-4 accent-watchmate-cyan rounded cursor-pointer"
              />
            </div>

            {/* Host only playback control */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border hover:border-watchmate-borderLight transition-all">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-watchmate-primary" />
                <div>
                  <p className="text-xs font-semibold text-watchmate-text">Host-only playback control</p>
                  <p className="text-[11px] text-watchmate-secondaryText">Only you can play, pause, and scrub the video</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hostOnlyControl}
                onChange={(e) => setHostOnlyControl(e.target.checked)}
                className="w-4 h-4 accent-watchmate-cyan rounded cursor-pointer"
              />
            </div>

            {/* Live Voice Chat Enabled */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border hover:border-watchmate-borderLight transition-all">
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-watchmate-brightBlue" />
                <div>
                  <p className="text-xs font-semibold text-watchmate-text">Live Voice Chat Enabled</p>
                  <p className="text-[11px] text-watchmate-secondaryText">Allow real-time WebRTC audio in the lounge</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceChatEnabled}
                onChange={(e) => setVoiceChatEnabled(e.target.checked)}
                className="w-4 h-4 accent-watchmate-cyan rounded cursor-pointer"
              />
            </div>

            {/* Live Floating Reactions & Popcorn */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-gold/30 hover:border-watchmate-gold/60 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <div className="flex items-center gap-3">
                <Smile className="w-4 h-4 text-watchmate-gold" />
                <div>
                  <p className="text-xs font-semibold text-watchmate-text flex items-center gap-1.5">
                    <span>Allow Live Floating Reactions</span>
                    <span className="text-[10px] text-watchmate-gold font-bold">🍿</span>
                  </p>
                  <p className="text-[11px] text-watchmate-secondaryText">Participants can send floating emoji & popcorn bursts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowReactions}
                onChange={(e) => setAllowReactions(e.target.checked)}
                className="w-4 h-4 accent-watchmate-gold rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 rounded-2xl text-sm font-bold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <span>{loading ? 'Creating Lounge...' : 'Create Watch Lounge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
