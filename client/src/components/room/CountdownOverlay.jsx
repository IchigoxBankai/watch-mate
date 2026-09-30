import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

export default function CountdownOverlay({ countdownData, onComplete }) {
  const [currentCount, setCurrentCount] = useState(null);

  useEffect(() => {
    if (!countdownData) {
      setCurrentCount(null);
      return;
    }

    const startCount = countdownData.count || 3;
    setCurrentCount(startCount);

    let count = startCount;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCurrentCount(count);
      } else if (count === 0) {
        setCurrentCount('GO!');
      } else {
        clearInterval(interval);
        setCurrentCount(null);
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownData, onComplete]);

  if (currentCount === null) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center select-none pointer-events-none">
      <div className="text-sm font-bold text-watchmate-cyan uppercase tracking-widest mb-3 animate-pulse">
        {countdownData?.message || 'Starting in'}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCount}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-display font-black text-7xl sm:text-9xl text-white tracking-wider text-glow-cyan"
        >
          {currentCount}
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-watchmate-secondaryText mt-4">
        Initiated by <span className="text-white font-semibold">{countdownData?.initiator || 'Host'}</span>
      </p>
    </div>
  );
}
