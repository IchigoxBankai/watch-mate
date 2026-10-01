import React from 'react';
import { Play, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AutoplayOverlay({ onUnlock, message = 'Tap to sync playback' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="relative group">
        <button
          onClick={onUnlock}
          className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-watchmate-primary via-blue-600 to-watchmate-cyan hover:from-blue-600 hover:to-cyan-400 text-white font-display font-bold text-sm sm:text-base shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <span>{message}</span>
        </button>
      </div>

      <p className="text-xs text-white/70 mt-3 max-w-xs flex items-center gap-1.5 justify-center">
        <Volume2 className="w-3.5 h-3.5 text-watchmate-cyan" />
        <span>Browser requires one tap to start audio & video sync</span>
      </p>
    </motion.div>
  );
}
