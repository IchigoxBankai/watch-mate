import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JoinRoomPage() {
  const { currentUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setError('');
    setLoading(true);
    setStatusText('Finding your room...');

    let cleanCode = roomCode.trim();
    if (cleanCode.includes('/room/')) {
      cleanCode = cleanCode.split('/room/')[1].split('?')[0].split('#')[0];
    }
    cleanCode = cleanCode.toLowerCase().replace(/[^a-z0-9-_]/g, '');

    if (!cleanCode) {
      setError('Please enter a valid room code or link');
      setLoading(false);
      return;
    }

    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = loginAsGuest(guestName || 'Watcher');
    }

    setTimeout(() => {
      navigate(`/room/${cleanCode}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Ambient Blue & Gold Glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-watchmate-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-watchmate-cyan/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(37,99,235,0.25)]"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/40 flex items-center justify-center text-watchmate-cyan mx-auto mb-4 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="font-display font-bold text-2xl text-watchmate-text mb-1">
            Join a Watch Room
          </h1>
          <p className="text-xs text-watchmate-secondaryText">
            Enter a room code or paste an invite link to enter the lounge
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-watchmate-error/15 border border-watchmate-error/30 flex items-center gap-2.5 text-xs text-watchmate-error font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          {!currentUser && (
            <div>
              <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                Your Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sam"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
              Enter room code or link
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SYNC-7X4K"
              value={roomCode}
              onChange={(e) => { setRoomCode(e.target.value); setError(''); }}
              className="w-full px-4 py-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-borderLight focus:border-watchmate-gold text-sm font-mono tracking-widest text-watchmate-text focus:outline-none text-center uppercase placeholder:text-watchmate-muted/60 focus:ring-1 focus:ring-watchmate-gold/50 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !roomCode.trim()}
            className="w-full btn-primary py-3.5 rounded-2xl text-sm font-bold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusText || 'Joining...'}</span>
              </>
            ) : (
              <>
                <span>Enter Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
