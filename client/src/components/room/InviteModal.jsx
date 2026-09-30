import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Link as LinkIcon, Sparkles } from 'lucide-react';

export default function InviteModal({ isOpen, onClose, roomId, roomName }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId.toUpperCase());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${roomName || 'Watch Party'}" on WatchMate`,
          text: `Watch together in real-time on WatchMate! Room code: ${roomId.toUpperCase()}`,
          url: inviteUrl
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-6 shadow-[0_20px_70px_rgba(37,99,235,0.3)] overflow-hidden"
        >
          {/* Ambient Sapphire & Gold Glows */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-watchmate-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-watchmate-cyan/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-watchmate-gold/10 rounded-full blur-xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/40 flex items-center justify-center text-watchmate-cyan shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Sparkles className="w-5 h-5 text-watchmate-gold" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-watchmate-text">
                  Invite Friends to Lounge
                </h3>
                <p className="text-xs text-watchmate-secondaryText">
                  Share this room and watch together in perfect sync
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Room Code Display */}
          <div className="mb-5 p-4 rounded-2xl bg-watchmate-surface border border-watchmate-borderLight shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-watchmate-cyan font-mono font-bold">
                Lounge Code
              </span>
              <span className="text-xs text-watchmate-gold font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-watchmate-gold animate-pulse" />
                Live Room
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black tracking-widest text-watchmate-gold drop-shadow-sm">
                {roomId.toUpperCase()}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/60 text-watchmate-text transition-all hover:bg-watchmate-elevatedHover"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-watchmate-online" />
                    <span className="text-watchmate-online font-bold">Copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-watchmate-cyan" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Link input */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-medium text-watchmate-secondaryText">
              Direct Room URL
            </label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-watchmate-surface border border-watchmate-border">
              <LinkIcon className="w-4 h-4 text-watchmate-cyan ml-2 shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full bg-transparent text-xs text-watchmate-text focus:outline-none truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-blue-glow"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-watchmate-text bg-watchmate-surface border border-watchmate-border hover:border-watchmate-cyan/60 hover:bg-watchmate-elevated transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-watchmate-cyan" />
              <span>Share Room</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-6 rounded-xl text-sm font-semibold text-watchmate-secondaryText hover:text-white bg-watchmate-surface border border-watchmate-border transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
