import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Plus, 
  ArrowRight, 
  Users, 
  Sparkles, 
  Clock, 
  Tv, 
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserHome() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [savedRooms, setSavedRooms] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('syncora_my_rooms');
    if (stored) {
      try {
        setSavedRooms(JSON.parse(stored));
      } catch {
        setSavedRooms([]);
      }
    } else {
      const sampleLounge = [
        {
          id: 'anime-lounge',
          name: 'Friday Anime Lounge',
          createdAt: Date.now() - 1000 * 60 * 60 * 2,
          lastVideo: 'Sintel - The Dragon Hunt',
          participantsCount: 3
        }
      ];
      setSavedRooms(sampleLounge);
    }

    setRecentVideos([
      {
        id: 'sample-1',
        title: 'Big Buck Bunny (4K Ultra HD)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '9:56',
        thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sample-2',
        title: 'Elephants Dream (Cinematic Animation)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: '10:53',
        thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sample-3',
        title: 'Sintel - Open Movie Project',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        duration: '14:47',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
      }
    ]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const startQuickRoomWithVideo = (video) => {
    const newRoomId = 'room-' + Math.random().toString(36).substring(2, 7);
    navigate(`/room/${newRoomId}`, { state: { initialVideo: video } });
  };

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 relative">
      {/* Vibrant Sapphire & Cyan Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-watchmate-primary/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-36 right-1/4 w-[350px] h-[350px] bg-watchmate-gold/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-watchmate-surface via-watchmate-elevated to-watchmate-surface border border-watchmate-borderLight shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-watchmate-gold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-watchmate-gold" />
            <span className="tracking-wider uppercase font-mono">YOUR CINEMA LOUNGE</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-watchmate-text">
            {getGreeting()}, <span className="bg-gradient-to-r from-watchmate-brightBlue via-watchmate-cyan to-watchmate-gold bg-clip-text text-transparent">{currentUser?.name || 'Explorer'}</span>
          </h1>
          <p className="text-sm text-watchmate-secondaryText mt-1">
            Pick up right where you left off or start a new watch room with friends.
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/join"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-watchmate-secondaryText bg-watchmate-surface border border-watchmate-border hover:border-watchmate-cyan/60 hover:bg-watchmate-elevated transition-all"
          >
            <span>Join a room</span>
          </Link>

          <Link
            to="/create"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-blue-glow transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Start a new room</span>
          </Link>
        </div>
      </div>

      {/* Continue Watching Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Tv className="w-4 h-4 text-watchmate-cyan" />
            <h2 className="font-display font-bold text-lg text-watchmate-text">
              Continue Watching & Featured Cinema
            </h2>
          </div>
          <span className="text-xs font-mono text-watchmate-gold font-semibold flex items-center gap-1">
            ★ 4K Master Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentVideos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ y: -4 }}
              className="group relative rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border overflow-hidden hover:border-watchmate-cyan/70 transition-all cursor-pointer p-3.5 flex flex-col justify-between shadow-card-subtle hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]"
              onClick={() => startQuickRoomWithVideo(video)}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-3.5 border border-watchmate-border">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-watchmate-bg/80 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full btn-primary flex items-center justify-center shadow-blue-glow">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#07111F]/90 backdrop-blur-sm text-[10px] font-mono text-watchmate-gold font-bold border border-watchmate-gold/30">
                  {video.duration}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-watchmate-text group-hover:text-watchmate-cyan transition-colors line-clamp-1 mb-1">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-watchmate-muted">
                  <span className="text-watchmate-secondaryText">Stream ready</span>
                  <span className="text-watchmate-cyan text-[11px] font-semibold flex items-center gap-1">
                    Watch in room <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Your Rooms Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-watchmate-brightBlue" />
            <h2 className="font-display font-bold text-lg text-watchmate-text">
              Your Rooms & Recent Lounges
            </h2>
          </div>
        </div>

        {savedRooms.length === 0 ? (
          <div className="p-10 rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border text-center flex flex-col items-center justify-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan mb-4 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-watchmate-text mb-1">
              No watch history yet.
            </h3>
            <p className="text-xs text-watchmate-muted max-w-sm mb-5">
              Your next movie night starts here. Create a room and invite your friends to start watching.
            </p>
            <Link
              to="/create"
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold shadow-blue-glow"
            >
              Create First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRooms.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-3xl bg-gradient-to-b from-watchmate-surface to-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/60 transition-all flex items-center justify-between group shadow-card-subtle hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-watchmate-online shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                    <h4 className="font-semibold text-sm text-watchmate-text truncate group-hover:text-watchmate-cyan transition-colors">
                      {r.name}
                    </h4>
                  </div>
                  <p className="text-xs text-watchmate-muted truncate">
                    Code: <span className="font-mono text-watchmate-gold font-semibold">{r.id.toUpperCase()}</span>
                  </p>
                </div>

                <Link
                  to={`/room/${r.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-watchmate-elevated hover:bg-watchmate-primary text-watchmate-secondaryText hover:text-white border border-watchmate-borderLight transition-all shrink-0 shadow-sm"
                >
                  Enter
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
