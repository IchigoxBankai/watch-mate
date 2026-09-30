import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { useRoom } from '../../context/RoomContext';

// Updated Reactions according to design specification: ❤️ 😂 🔥 👀 😭 🍿
const AVAILABLE_EMOJIS = ['❤️', '😂', '🔥', '👀', '😭', '🍿'];

export function FloatingReactionsOverlay() {
  const { reactions } = useChat();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {reactions.map((rxn) => (
          <motion.div
            key={rxn.id}
            initial={{ 
              opacity: 0, 
              y: 60, 
              scale: 0.6,
              x: `${rxn.xPos || 50}%`
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: -220,
              scale: [0.6, 1.25, 1.1, 0.8]
            }}
            transition={{ 
              duration: 2.3,
              ease: "easeOut",
              times: [0, 0.15, 0.8, 1]
            }}
            className="absolute bottom-16 flex flex-col items-center select-none"
          >
            <span className="text-4xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transform active:scale-125 transition-transform">
              {rxn.emoji}
            </span>
            {rxn.senderName && (
              <span className="text-[10px] text-watchmate-text bg-watchmate-elevated/90 backdrop-blur-md px-2.5 py-0.5 rounded-full mt-1 border border-watchmate-border font-medium shadow-md">
                {rxn.senderName}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function QuickReactionButtons({ className = '' }) {
  const { sendReaction } = useChat();
  const { room } = useRoom();

  if (room?.settings && room.settings.allowReactions === false) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 p-1.5 rounded-full bg-watchmate-surface/95 backdrop-blur-md border border-watchmate-border shadow-lg ${className}`}>
      {AVAILABLE_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-watchmate-elevated text-lg transition-transform hover:scale-125 active:scale-90 hover:shadow-[0_0_10px_rgba(56,189,248,0.4)]"
          title={`React ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
