import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function LoadingScreen({ message = "Getting everyone together..." }) {
  return (
    <div className="fixed inset-0 bg-watchmate-bg z-50 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background ambient blue lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-watchmate-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-watchmate-cyan/15 rounded-full blur-2xl pointer-events-none" />

      {/* Sync Rings Animation in Blue & Cyan */}
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border border-watchmate-primary/30 border-t-watchmate-primary"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute w-16 h-16 rounded-full border border-watchmate-cyan/40 border-b-watchmate-cyan"
        />
        <div className="absolute">
          <Logo size="sm" showText={false} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h3 className="font-display text-lg font-bold text-watchmate-text tracking-wide mb-1">
          Watch<span className="text-watchmate-cyan">Mate</span>
        </h3>
        <p className="text-sm text-watchmate-muted animate-pulse">
          {message}
        </p>
      </motion.div>
    </div>
  );
}
