import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Lock, 
  Smile, 
  RefreshCw, 
  Smartphone, 
  Users, 
  ArrowRight, 
  Radio, 
  Film, 
  Share2, 
  Check, 
  Tv, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Headphones,
  Eye,
  Flame,
  Heart
} from 'lucide-react';
import Logo from '../components/Logo';

export default function LandingPage() {
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [heroMuted, setHeroMuted] = useState(false);
  const [heroTime, setHeroTime] = useState(142);
  const [heroActiveVoice, setHeroActiveVoice] = useState(1);
  const [heroReactions, setHeroReactions] = useState([
    { id: 1, emoji: '🔥', x: 28, name: 'Alex' },
    { id: 2, emoji: '❤️', x: 72, name: 'Sarah' }
  ]);
  const [copiedHeroCode, setCopiedHeroCode] = useState(false);
  const [timecode, setTimecode] = useState('01:24:58:12');

  useEffect(() => {
    const timer = setInterval(() => {
      if (heroPlaying) {
        setHeroTime(prev => (prev > 300 ? 120 : prev + 1));
      }
      const now = new Date();
      const ms = Math.floor(now.getMilliseconds() / 10);
      const s = String(now.getSeconds()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const h = String(now.getHours()).padStart(2, '0');
      setTimecode(`${h}:${m}:${s}:${String(ms).padStart(2, '0')}`);
    }, 1000);

    const voiceCycle = setInterval(() => {
      setHeroActiveVoice(prev => (prev === 1 ? 2 : prev === 2 ? 0 : 1));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(voiceCycle);
    };
  }, [heroPlaying]);

  const addHeroReaction = (emoji) => {
    const newRxn = {
      id: Date.now(),
      emoji,
      x: Math.floor(Math.random() * 60) + 20,
      name: 'You'
    };
    setHeroReactions(prev => [...prev.slice(-4), newRxn]);
    setTimeout(() => {
      setHeroReactions(prev => prev.filter(r => r.id !== newRxn.id));
    }, 2400);
  };

  const handleCopyHero = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/anime-night`);
    setCopiedHeroCode(true);
    setTimeout(() => setCopiedHeroCode(false), 2000);
  };

  const formatHeroTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text overflow-hidden selection:bg-watchmate-primary selection:text-white relative">
      {/* Cinematic Deep-Blue & Warm Gold Atmospheric Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-watchmate-primary/20 via-watchmate-cyan/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[200px] right-1/4 w-[400px] h-[400px] bg-watchmate-gold/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[850px] -left-48 w-[650px] h-[650px] bg-watchmate-primaryDark/25 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[1500px] -right-48 w-[750px] h-[750px] bg-watchmate-cyan/15 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: CINEMATIC SOCIAL WATCH LOUNGE (2-COLUMN SPLIT)           */}
      {/* ========================================================================= */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        
        {/* Top Telemetry Tag */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 pb-3 border-b border-watchmate-border text-[11px] font-mono text-watchmate-muted tracking-widest uppercase">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-watchmate-cyan font-bold">
              <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              WATCHMATE DIGITAL CINEMA
            </span>
            <span className="hidden sm:inline text-watchmate-muted/40">•</span>
            <span className="hidden sm:inline text-watchmate-gold font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-watchmate-gold" />
              SUB-MILLISECOND SYNC
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-watchmate-muted">TC: <span className="text-watchmate-text font-semibold">{timecode}</span></span>
            <span className="px-2.5 py-0.5 rounded-full bg-watchmate-online/15 text-watchmate-online border border-watchmate-online/30 font-sans text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-watchmate-online animate-pulse" />
              WEBRTC AUDIO ACTIVE
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Left Hero Copy & CTA | Right Watch Room Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ================= LEFT COLUMN: HERO COPY & CTAS ================= */}
          <div className="lg:col-span-5 text-left flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-watchmate-surface border border-watchmate-borderLight shadow-[0_0_20px_rgba(56,189,248,0.15)] mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-watchmate-gold animate-pulse" />
              <span className="text-xs font-semibold text-watchmate-text tracking-wide">
                The Next-Gen Digital Living Room for Real-Time Movie Nights
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] mb-5 text-white"
            >
              Watch together.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-watchmate-secondaryText leading-relaxed mb-8 max-w-xl"
            >
              Stream shows, videos, anime, and movies with friends in perfect lockstep synchronization while talking naturally through real-time spatial voice chat.
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
            >
              <Link
                to="/create"
                className="btn-primary flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold shadow-blue-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Create a Room</span>
              </Link>

              <Link
                to="/join"
                className="btn-secondary flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold transition-all hover:border-watchmate-cyan/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                <span>Join with Room Code</span>
                <ArrowRight className="w-4 h-4 text-watchmate-cyan" />
              </Link>
            </motion.div>

            {/* Social Proof Mini Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-2 text-xs text-watchmate-muted"
            >
              <div className="flex items-center gap-0.5 text-watchmate-gold">
                {'★★★★★'.split('').map((star, idx) => (
                  <span key={idx} className="text-sm">★</span>
                ))}
              </div>
              <span>Sub-300ms drift lock • No extension or install required</span>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: CINEMATIC WATCH ROOM PREVIEW ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="lg:col-span-7 relative w-full rounded-3xl sm:rounded-[2.2rem] bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight p-3 sm:p-4 shadow-[0_20px_90px_-15px_rgba(37,99,235,0.35)] overflow-hidden"
          >
            {/* Top Stage Control Header */}
            <div className="flex items-center justify-between pb-3 px-2 sm:px-3 border-b border-watchmate-border mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-watchmate-primary shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-watchmate-cyan shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-watchmate-gold shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                </div>
                <span className="text-[11px] font-mono text-watchmate-secondaryText pl-2 border-l border-watchmate-border truncate max-w-[170px] sm:max-w-none">
                  watchmate.app/room/tokyo-night-cinema
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyHero}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-watchmate-elevated hover:bg-watchmate-elevatedHover text-xs text-watchmate-text border border-watchmate-borderLight transition-all"
                >
                  {copiedHeroCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-watchmate-online" />
                      <span className="text-watchmate-online font-semibold text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-watchmate-cyan" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-watchmate-gold/10 text-watchmate-gold text-[11px] font-semibold border border-watchmate-gold/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-watchmate-gold animate-pulse" />
                  <span>⚡ Locked 0ms</span>
                </div>
              </div>
            </div>

            {/* Theater Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Main Stage Screen (md: 7 cols) */}
              <div className="md:col-span-7 relative aspect-video rounded-2xl bg-[#050C16] overflow-hidden border border-watchmate-border group shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80"
                  alt="Cinema Visual"
                  className={`w-full h-full object-cover transition-transform duration-700 ${heroPlaying ? 'scale-105' : 'scale-100 opacity-70'}`}
                />

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/90 via-transparent to-[#07111F]/30 pointer-events-none" />

                {/* Floating Reaction Particles in Hero */}
                <AnimatePresence>
                  {heroReactions.map((rxn) => (
                    <motion.div
                      key={rxn.id}
                      initial={{ opacity: 0, y: 30, scale: 0.5, x: `${rxn.x}%` }}
                      animate={{ opacity: [0, 1, 1, 0], y: -120, scale: [0.5, 1.2, 1, 0.8] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.2, ease: "easeOut" }}
                      className="absolute bottom-14 flex flex-col items-center pointer-events-none z-20"
                    >
                      <span className="text-3xl filter drop-shadow-lg">{rxn.emoji}</span>
                      <span className="text-[9px] bg-watchmate-elevated/90 px-2 py-0.5 rounded-full text-watchmate-text border border-watchmate-border mt-0.5 font-mono shadow-md">
                        {rxn.name}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Top Film Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#07111F]/80 backdrop-blur-md border border-watchmate-border text-[11px] text-watchmate-text font-medium shadow-md">
                    <Film className="w-3 h-3 text-watchmate-cyan" />
                    <span className="truncate max-w-[160px] sm:max-w-[200px]">Sintel: The Dragon Hunt</span>
                  </div>
                </div>

                {/* Bottom Interactive Cinema Controls Bar */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-[#07111F]/95 via-[#07111F]/70 to-transparent flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHeroPlaying(!heroPlaying)}
                      className="w-8 h-8 rounded-lg btn-primary text-white flex items-center justify-center shadow-blue-glow transition-transform hover:scale-110 active:scale-95"
                    >
                      {heroPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setHeroMuted(!heroMuted)}
                      className="p-1.5 rounded-lg text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-elevated transition-colors"
                    >
                      {heroMuted ? <MicOff className="w-3.5 h-3.5 text-watchmate-error" /> : <Volume2 className="w-3.5 h-3.5 text-watchmate-cyan" />}
                    </button>

                    <div className="text-[11px] font-mono text-watchmate-secondaryText">
                      <span className="text-watchmate-cyan font-bold">{formatHeroTime(heroTime)}</span>
                      <span className="text-watchmate-muted mx-0.5">/</span>
                      <span className="text-watchmate-muted">14:47</span>
                    </div>
                  </div>

                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-1 p-0.5 rounded-full bg-watchmate-surface/90 backdrop-blur-md border border-watchmate-border">
                    {['🔥', '❤️', '😂', '🍿'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addHeroReaction(emoji)}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-watchmate-elevated text-xs hover:scale-125 transition-transform"
                        title={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Stage: Social Voice Deck & Synced Lounge (md: 5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
                
                {/* Voice Deck Module */}
                <div className="p-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border shadow-md">
                  <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-watchmate-muted uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3 h-3 text-watchmate-cyan" />
                      Spatial Voice Lounge
                    </span>
                    <span className="text-watchmate-online font-mono text-[9px]">3 ON MIC</span>
                  </div>

                  {/* Avatar Audio Mesh */}
                  <div className="space-y-1.5">
                    {/* Host User */}
                    <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${heroActiveVoice === 1 ? 'bg-watchmate-cyan/10 border border-watchmate-cyan/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]' : 'bg-watchmate-surface border border-watchmate-border'}`}>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-watchmate-primary/25 text-watchmate-cyan border border-watchmate-cyan/40 flex items-center justify-center text-[10px] font-bold">
                            NV
                          </div>
                          {heroActiveVoice === 1 && (
                            <span className="absolute -inset-0.5 rounded-full border border-watchmate-cyan animate-ping pointer-events-none opacity-70" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-watchmate-text leading-tight">Nihar (Host)</p>
                          <p className="text-[9px] text-watchmate-cyan font-medium">
                            {heroActiveVoice === 1 ? '🎙 Speaking...' : 'Mic Ready'}
                          </p>
                        </div>
                      </div>
                      {heroActiveVoice === 1 && (
                        <div className="flex items-center gap-0.5 h-2.5">
                          <span className="w-0.5 bg-watchmate-cyan h-2.5 rounded-full animate-bounce" />
                          <span className="w-0.5 bg-watchmate-cyan h-1.5 rounded-full animate-bounce delay-75" />
                          <span className="w-0.5 bg-watchmate-cyan h-3 rounded-full animate-bounce delay-150" />
                        </div>
                      )}
                    </div>

                    {/* Participant 2 */}
                    <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${heroActiveVoice === 2 ? 'bg-watchmate-cyan/10 border border-watchmate-cyan/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]' : 'bg-watchmate-surface border border-watchmate-border'}`}>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-watchmate-primary/20 text-watchmate-brightBlue border border-watchmate-brightBlue/40 flex items-center justify-center text-[10px] font-bold">
                            AV
                          </div>
                          {heroActiveVoice === 2 && (
                            <span className="absolute -inset-0.5 rounded-full border border-watchmate-cyan animate-ping pointer-events-none opacity-70" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-watchmate-text leading-tight">Alex Vance</p>
                          <p className="text-[9px] text-watchmate-secondaryText">
                            {heroActiveVoice === 2 ? '🎙 "Soundtrack is epic!"' : 'Listening'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Stream Module */}
                <div className="p-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-watchmate-muted font-mono">Sarah • 14:42</span>
                      <span className="p-2 rounded-xl bg-watchmate-surface text-watchmate-text border border-watchmate-border mt-0.5 rounded-tl-sm max-w-[95%]">
                        The soundtrack synchronization is unreal 🍿
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-watchmate-cyan font-mono">You (Host) • 14:43</span>
                      <span className="p-2 rounded-xl btn-primary text-white mt-0.5 rounded-tr-sm shadow-md">
                        Everyone's on exact same frame! 🔥
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-watchmate-border flex items-center justify-between text-[10px] text-watchmate-muted">
                    <span className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-watchmate-cyan animate-pulse" />
                      Live Lounge Connected
                    </span>
                    <Link to="/create" className="text-watchmate-cyan hover:underline font-semibold">
                      Enter Full Lounge →
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INFINITE KINETIC MARQUEE STRIP                                         */}
      {/* ========================================================================= */}
      <div className="w-full py-4 bg-gradient-to-r from-watchmate-bg via-watchmate-bgSecondary to-watchmate-bg border-y border-watchmate-border overflow-hidden whitespace-nowrap select-none shadow-inner">
        <div className="flex items-center gap-8 animate-marquee text-xs font-mono tracking-widest text-watchmate-muted uppercase">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2 text-watchmate-cyan font-bold">
                <Zap className="w-3.5 h-3.5 text-watchmate-cyan" /> SUB-MILLISECOND LOCKSTEP SYNC
              </span>
              <span className="text-watchmate-gold">★</span>
              <span className="flex items-center gap-2 text-watchmate-brightBlue font-semibold">
                <Headphones className="w-3.5 h-3.5" /> LOW-LATENCY WEBRTC VOICE
              </span>
              <span className="text-watchmate-cyan">•</span>
              <span className="flex items-center gap-2 text-watchmate-gold font-bold">
                <Sparkles className="w-3.5 h-3.5" /> 🍿 POPCORN & FLOATING REACTIONS
              </span>
              <span className="text-watchmate-gold">★</span>
              <span className="flex items-center gap-2 text-watchmate-online font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> ENCRYPTED PRIVATE ROOMS
              </span>
              <span className="text-watchmate-cyan">•</span>
              <span className="flex items-center gap-2 text-watchmate-text">
                <Film className="w-3.5 h-3.5 text-watchmate-cyan" /> 4K DIRECT STREAMS & YOUTUBE DECK
              </span>
              <span className="text-watchmate-gold">★</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: THE 3-ACT CINEMATIC REEL                                 */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase font-mono tracking-widest text-watchmate-cyan font-bold block mb-3">
            [ SIMPLE 3-STEP WORKFLOW ]
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-watchmate-text tracking-tight">
            How WatchMate Works
          </h2>
          <p className="text-sm sm:text-base text-watchmate-secondaryText mt-3">
            Three simple steps to start streaming, synchronizing, and voice chatting in cinema quality.
          </p>
        </div>

        {/* Connected Track */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-[2px] bg-gradient-to-r from-watchmate-primary via-watchmate-cyan to-watchmate-gold -translate-y-12 -z-0 opacity-40" />

          {/* Act 1 */}
          <div className="relative z-10 group">
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-primary/70 transition-all duration-300 shadow-xl flex flex-col justify-between h-full group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-4xl font-black text-watchmate-primary tracking-tighter">
                    01
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-watchmate-primary/15 border border-watchmate-primary/40 flex items-center justify-center text-watchmate-brightBlue group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Film className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-2xl text-watchmate-text mb-3">
                  Create Your Room
                </h3>
                <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                  Create your cinema lounge in one click. Pick from curated 4K movies, direct MP4 video URLs, or YouTube links.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-border text-[11px] font-mono text-watchmate-secondaryText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-watchmate-primary shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                <span>Instant code & link generation</span>
              </div>
            </div>
          </div>

          {/* Act 2 */}
          <div className="relative z-10 group">
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/70 transition-all duration-300 shadow-xl flex flex-col justify-between h-full group-hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-4xl font-black text-watchmate-cyan tracking-tighter">
                    02
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/40 flex items-center justify-center text-watchmate-cyan group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    <Share2 className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-2xl text-watchmate-text mb-3">
                  Invite Friends
                </h3>
                <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                  Share your room link or short code with friends. They can join right away from any desktop or mobile browser.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-border text-[11px] font-mono text-watchmate-secondaryText flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-watchmate-cyan shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                <span>Zero extension or software install</span>
              </div>
            </div>
          </div>

          {/* Act 3 */}
          <div className="relative z-10 group">
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-gold/70 transition-all duration-300 shadow-xl flex flex-col justify-between h-full group-hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-4xl font-black text-watchmate-gold tracking-tighter">
                    03
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-watchmate-gold/15 border border-watchmate-gold/40 flex items-center justify-center text-watchmate-gold group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-2xl text-watchmate-text mb-3">
                  Watch, Talk & React
                </h3>
                <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                  Press play and experience everything in millisecond lockstep while voice chatting and dropping live reactions.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-border text-[11px] font-mono text-watchmate-gold flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-watchmate-gold shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                <span>🍿 Spatial Voice & Popcorn reactions</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ASYMMETRIC BENTO CINEMA MATRIX (FEATURES)                              */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-watchmate-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-watchmate-cyan font-bold block mb-2">
              [ THE WATCHMATE ENGINE ]
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-watchmate-text tracking-tight">
              Designed for Cinematic Shared Screen Nights
            </h2>
          </div>
          <p className="text-sm text-watchmate-secondaryText max-w-md">
            Every layer is engineered for zero-lag synchronization, crystal audio clarity, and social interaction.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Anti-Drift Dual Playhead Sync Engine */}
          <div className="md:col-span-8 p-8 sm:p-10 rounded-[2rem] bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-border hover:border-watchmate-cyan/60 transition-all flex flex-col justify-between relative overflow-hidden group shadow-card-subtle">
            <div className="relative z-10 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watchmate-cyan/15 border border-watchmate-cyan/35 text-watchmate-cyan text-xs font-mono font-bold mb-4">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>TOLERANCE ±300MS • ZERO RELOAD</span>
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-watchmate-text mb-2">
                Sub-Second Video Synchronization
              </h3>
              <p className="text-sm text-watchmate-secondaryText max-w-xl">
                When the host pauses or seeks, state broadcasts across all devices. Smart drift correction continuously keeps everyone on the exact same frame without reload loops.
              </p>
            </div>

            {/* Interactive Dual Playhead Scrubber Visual */}
            <div className="relative z-10 p-5 rounded-2xl bg-watchmate-surface border border-watchmate-borderLight space-y-4 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-watchmate-cyan flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-watchmate-cyan animate-pulse shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                  Host Playhead (00:14:28)
                </span>
                <span className="text-watchmate-gold font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-watchmate-gold" />
                  0ms Offset [FRAME LOCKED]
                </span>
              </div>

              {/* Progress track */}
              <div className="relative h-3 bg-watchmate-elevated rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-2/3 bg-blue-gradient rounded-full" />
                <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-5 h-5 -ml-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(56,189,248,1),0_0_6px_#FBBF24] border-2 border-watchmate-cyan" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-watchmate-muted">
                <span>00:00:00</span>
                <span className="text-watchmate-brightBlue font-semibold">Sync Engine: Active (Socket.IO + WebRTC)</span>
                <span>00:24:00</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: WebRTC Spatial Voice Lounge */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/60 transition-all flex flex-col justify-between shadow-card-subtle">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-6 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-watchmate-text mb-2">
                Live Voice Chat
              </h3>
              <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                Low-latency WebRTC mesh audio. Voice Activity Detection (VAD) automatically highlights speaking avatars with luminous cyan pulse rings.
              </p>
            </div>

            {/* Speaking Avatars Cluster */}
            <div className="p-4 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-border flex items-center justify-around">
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-watchmate-primary/25 text-watchmate-cyan border-2 border-watchmate-cyan flex items-center justify-center font-bold text-sm shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                  NV
                </div>
                <span className="text-[10px] text-watchmate-cyan font-mono mt-1 font-bold">🎙 Speaking</span>
              </div>

              <div className="h-8 w-[1px] bg-watchmate-border" />

              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-watchmate-surface text-watchmate-secondaryText border border-watchmate-border flex items-center justify-center font-bold text-sm">
                  AV
                </div>
                <span className="text-[10px] text-watchmate-muted font-mono mt-1">Listening</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Multi-Source Film Deck */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-brightBlue/60 transition-all flex flex-col justify-between shadow-card-subtle">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-watchmate-brightBlue/15 border border-watchmate-brightBlue/35 flex items-center justify-center text-watchmate-brightBlue mb-6 shadow-[0_0_15px_rgba(96,165,250,0.25)]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-watchmate-text mb-2">
                Universal Video Deck
              </h3>
              <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                Support for direct 4K video files (MP4/WebM), YouTube embeds, and local uploads without leaving the lounge.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-watchmate-bgSecondary border border-watchmate-border flex items-center justify-between text-watchmate-secondaryText">
                <span>• Direct MP4 / WebM / 4K</span>
                <span className="text-watchmate-cyan font-bold">Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-watchmate-bgSecondary border border-watchmate-border flex items-center justify-between text-watchmate-secondaryText">
                <span>• YouTube Embed Engine</span>
                <span className="text-watchmate-gold font-bold">Ready</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Floating Live Reaction Bursts (Warm Gold Cinema Card) */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-gold/35 hover:border-watchmate-gold/70 transition-all flex flex-col justify-between shadow-[0_0_25px_rgba(251,191,36,0.15)]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-watchmate-gold/15 border border-watchmate-gold/35 flex items-center justify-center text-watchmate-gold mb-6 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-watchmate-text mb-2">
                Live Reactions & Popcorn
              </h3>
              <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                Send lightweight floating reactions (❤️, 😂, 🔥, 👀, 😭, 🍿) that float upward smoothly without obscuring the movie.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-gold/20 flex items-center justify-center gap-3.5 text-2xl">
              <span className="animate-bounce">❤️</span>
              <span className="animate-bounce delay-100">😂</span>
              <span className="animate-bounce delay-200">🔥</span>
              <span className="animate-bounce delay-300">🍿</span>
              <span className="animate-bounce delay-150">👀</span>
            </div>
          </div>

          {/* Bento Card 5: Mobile Ready & PWA */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-online/60 transition-all flex flex-col justify-between shadow-card-subtle">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-watchmate-online/15 border border-watchmate-online/35 flex items-center justify-center text-watchmate-online mb-6 shadow-[0_0_15px_rgba(74,222,128,0.25)]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-2xl text-watchmate-text mb-2">
                Mobile & PWA Ready
              </h3>
              <p className="text-sm text-watchmate-secondaryText leading-relaxed mb-6">
                Adaptive mobile bottom sheets, large touch controls, and installable PWA support on both iOS and Android devices.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-watchmate-bgSecondary border border-watchmate-border flex items-center justify-between text-xs font-mono text-watchmate-online font-semibold">
              <span>PWA Install Ready</span>
              <span>iOS & Android</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CINEMATIC BOTTOM CTA                                                   */}
      {/* ========================================================================= */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="relative p-12 sm:p-16 rounded-[2.5rem] bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight overflow-hidden shadow-[0_20px_80px_rgba(37,99,235,0.25)]">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-watchmate-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-watchmate-cyan/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-watchmate-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-watchmate-gold/15 border border-watchmate-gold/30 text-xs font-mono uppercase tracking-widest text-watchmate-gold font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-watchmate-gold" />
              READY FOR MOVIE NIGHT
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-watchmate-text tracking-tight mb-4">
              Your next cinema night starts in seconds.
            </h2>
            <p className="text-base text-watchmate-secondaryText leading-relaxed mb-10">
              Create a room, share the link with friends, and enjoy your favorite shows together in crystal synchronization.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl text-base font-bold btn-primary shadow-blue-glow transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Create a Watch Room</span>
              </Link>
              
              <Link
                to="/join"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold btn-secondary hover:border-watchmate-cyan transition-all"
              >
                <span>Join with Code</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 border-t border-watchmate-border text-xs text-watchmate-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6 font-mono text-[11px] text-watchmate-secondaryText">
            <span className="text-watchmate-cyan">TC 00:00:00:00</span>
            <span>•</span>
            <span className="text-watchmate-gold">★ WEBRTC v2.4</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} WatchMate</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
