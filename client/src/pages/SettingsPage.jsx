import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Sparkles, 
  Volume2, 
  Shield, 
  LogOut, 
  Check, 
  Mic, 
  Moon, 
  Sliders,
  Settings as SettingsIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateUserProfile({
      name: name.trim(),
      avatar: avatar.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative">
      {/* Ambient Sapphire & Cyan Glows */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-watchmate-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Page Title */}
      <div className="flex items-center gap-3.5 mb-8 p-6 rounded-3xl bg-gradient-to-r from-watchmate-surface via-watchmate-elevated to-watchmate-surface border border-watchmate-borderLight shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/40 flex items-center justify-center text-watchmate-cyan shadow-[0_0_15px_rgba(56,189,248,0.3)]">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-watchmate-text">
            Settings & Preferences
          </h1>
          <p className="text-xs text-watchmate-secondaryText">
            Manage your WatchMate profile, audio preferences, and cinema appearance
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-borderLight shadow-card-subtle"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-watchmate-cyan" />
            <h2 className="font-display font-bold text-base text-watchmate-text">
              Profile & Identity
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none focus:ring-1 focus:ring-watchmate-cyan/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/50 focus:ring-1 focus:ring-watchmate-cyan/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs text-watchmate-gold font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-watchmate-gold" /> Profile saved successfully!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold shadow-blue-glow transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        {/* 2. Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-borderLight space-y-4 shadow-card-subtle"
        >
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-watchmate-brightBlue" />
            <h2 className="font-display font-bold text-base text-watchmate-text">
              Appearance & Cinema Motion
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-watchmate-surface border border-watchmate-border">
            <div>
              <p className="text-xs font-semibold text-watchmate-text">Reduced Motion</p>
              <p className="text-[11px] text-watchmate-secondaryText">Minimize floating reactions and UI transitions</p>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 accent-watchmate-cyan rounded cursor-pointer"
            />
          </div>
        </motion.div>

        {/* 3. Privacy & History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-borderLight space-y-4 shadow-card-subtle"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-watchmate-online" />
            <h2 className="font-display font-bold text-base text-watchmate-text">
              Privacy & Lounge History
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-watchmate-surface border border-watchmate-border">
            <div>
              <p className="text-xs font-semibold text-watchmate-text">Save Recent Lounges History</p>
              <p className="text-[11px] text-watchmate-secondaryText">Store your created and joined lounges locally</p>
            </div>
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
              className="w-4 h-4 accent-watchmate-cyan rounded cursor-pointer"
            />
          </div>
        </motion.div>

        {/* 4. Account & Sign Out */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold bg-watchmate-surface hover:bg-watchmate-error/15 border border-watchmate-border hover:border-watchmate-error/40 text-watchmate-error transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of WatchMate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
