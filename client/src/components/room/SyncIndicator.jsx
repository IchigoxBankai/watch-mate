import React from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';

export default function SyncIndicator() {
  const { syncStatus } = useRoom();

  const statusConfig = {
    synced: {
      color: 'text-watchmate-online bg-watchmate-online/10 border-watchmate-online/20',
      dot: 'bg-watchmate-online',
      label: 'Synced',
      icon: <Check className="w-3 h-3" />
    },
    syncing: {
      color: 'text-watchmate-cyan bg-watchmate-cyan/10 border-watchmate-cyan/20',
      dot: 'bg-watchmate-cyan animate-ping',
      label: 'Syncing...',
      icon: <RefreshCw className="w-3 h-3 animate-spin" />
    },
    disconnected: {
      color: 'text-watchmate-error bg-watchmate-error/10 border-watchmate-error/20',
      dot: 'bg-watchmate-error',
      label: 'Reconnecting...',
      icon: <AlertCircle className="w-3 h-3" />
    }
  };

  const current = statusConfig[syncStatus] || statusConfig.synced;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.color} backdrop-blur-sm select-none`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </div>
  );
}
