import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-base', dot: 'w-1.5 h-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', dot: 'w-2.5 h-2.5' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl', dot: 'w-3.5 h-3.5' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* App Logo Container */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center shrink-0`}>
        {/* Glow behind the logo */}
        <div className="absolute inset-0 bg-watchmate-cyan/25 rounded-2xl blur-md -z-10 animate-pulse" />

        {!imageError ? (
          <img
            src={logoImg}
            alt="WatchMate Logo"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]"
          />
        ) : (
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-md">
            <circle cx="14" cy="18" r="9" stroke="#3B82F6" strokeWidth="2.8" strokeDasharray="42 15" className="opacity-95" />
            <circle cx="22" cy="18" r="9" stroke="#38BDF8" strokeWidth="2.8" strokeDasharray="42 15" className="opacity-95" />
            <path d="M17 14L23 18L17 22V14Z" fill="#FBBF24" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex items-center gap-1">
          <span className={`font-display font-black tracking-tight text-watchmate-text ${currentSize.text}`}>
            Watch<span className="text-watchmate-cyan">Mate</span>
          </span>
          <span className={`${currentSize.dot} rounded-full bg-watchmate-gold shadow-[0_0_8px_rgba(251,191,36,0.9)]`} />
        </div>
      )}
    </div>
  );
}
