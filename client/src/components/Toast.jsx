import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

export default function Toast() {
  const { toastNotification } = useRoom();

  if (!toastNotification) return null;

  const icons = {
    info: <Info className="w-4 h-4 text-watchmate-cyan" />,
    success: <CheckCircle2 className="w-4 h-4 text-watchmate-online" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <AlertCircle className="w-4 h-4 text-watchmate-error" />
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            key={toastNotification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-watchmate-elevated/95 backdrop-blur-md border border-watchmate-border shadow-2xl text-watchmate-text text-sm font-medium"
          >
            {icons[toastNotification.type] || icons.info}
            <span>{toastNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
