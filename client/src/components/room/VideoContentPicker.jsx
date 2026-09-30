import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Film, 
  Link as LinkIcon, 
  Video, 
  Upload, 
  Play, 
  Check, 
  Sparkles, 
  Tv, 
  Monitor, 
  Subtitles,
  Search,
  Radio,
  Loader2,
  TrendingUp,
  Music,
  Flame
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { parseSubtitles } from './SubtitlesOverlay';

export const parseYouTubeId = (url) => {
  if (!url) return null;
  const clean = url.trim();

  // If already an 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Handle /live/ID (e.g. https://www.youtube.com/live/YMJ1HsG4lhY?si=...)
  const liveMatch = clean.match(/(?:youtube\.com\/live\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  // Handle /shorts/ID
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Handle youtu.be/ID
  const youtuBeMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];

  // Handle watch?v=ID or &v=ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle /embed/ID
  const embedMatch = clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
};

const SAMPLE_VIDEOS = [
  {
    id: 'sample-1',
    title: 'Big Buck Bunny (4K Ultra HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    type: 'direct',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    description: 'Classic open movie project animation with vibrant colors and rich action.'
  },
  {
    id: 'sample-2',
    title: 'Elephants Dream (Cinematic Animation)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    type: 'direct',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    description: 'Atmospheric sci-fi journey with deep spatial design.'
  },
  {
    id: 'sample-3',
    title: 'Sintel - The Dragon Hunt',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 887,
    type: 'direct',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Emotional fantasy story of courage, connection, and companionship.'
  },
  {
    id: 'sample-4',
    title: 'Tears of Steel (Sci-Fi Visual Effects)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
    type: 'direct',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    description: 'High-octane futuristic thriller in a dystopian cybernetic world.'
  }
];

const INITIAL_YOUTUBE_RESULTS = [
  {
    id: 'jfKfPfyJRdk',
    youtubeId: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    channel: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    duration: 'LIVE',
    isLive: true,
    views: '45K watching'
  },
  {
    id: '4xDzrJKXOOY',
    youtubeId: '4xDzrJKXOOY',
    title: 'Synthwave Radio - Chill Retro Beats to Relax/Game to',
    channel: 'Lofi Girl',
    thumbnail: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    duration: 'LIVE',
    isLive: true,
    views: '12K watching'
  },
  {
    id: 'cqGjhVJWtEg',
    youtubeId: 'cqGjhVJWtEg',
    title: 'Spider-Man: Across the Spider-Verse - Official Trailer',
    channel: 'Sony Pictures',
    thumbnail: 'https://img.youtube.com/vi/cqGjhVJWtEg/hqdefault.jpg',
    duration: '2:25',
    isLive: false,
    views: '48M views'
  },
  {
    id: 'd9MyW72ELq0',
    youtubeId: 'd9MyW72ELq0',
    title: 'Avatar: The Way of Water - Official Teaser Trailer',
    channel: 'Avatar',
    thumbnail: 'https://img.youtube.com/vi/d9MyW72ELq0/hqdefault.jpg',
    duration: '1:37',
    isLive: false,
    views: '54M views'
  },
  {
    id: 'qEVUtrk8_B4',
    youtubeId: 'qEVUtrk8_B4',
    title: 'John Wick: Chapter 4 - Final Official Trailer',
    channel: 'Lionsgate Movies',
    thumbnail: 'https://img.youtube.com/vi/qEVUtrk8_B4/hqdefault.jpg',
    duration: '2:30',
    isLive: false,
    views: '38M views'
  },
  {
    id: 'JkaxUblCGz0',
    youtubeId: 'JkaxUblCGz0',
    title: 'Cyberpunk: Edgerunners - Official Anime Trailer',
    channel: 'Netflix',
    thumbnail: 'https://img.youtube.com/vi/JkaxUblCGz0/hqdefault.jpg',
    duration: '2:12',
    isLive: false,
    views: '18M views'
  }
];

const YOUTUBE_QUICK_TAGS = [
  { label: '🔥 All Trending', query: 'popular trailers 2026' },
  { label: '🔴 24/7 Live Streams', query: 'live stream' },
  { label: '🎧 Lo-Fi Beats', query: 'lofi chill beats live' },
  { label: '🎬 Movie Trailers', query: 'official movie trailer 4K' },
  { label: '⚔️ Anime', query: 'anime episodes trailer' },
  { label: '🎮 Gaming', query: 'gameplay trailer 4k' },
  { label: '🎵 Music Hits', query: 'popular official music video' }
];

const NETFLIX_PRESETS = [
  {
    netflixId: '80057281',
    title: 'Stranger Things',
    url: 'https://www.netflix.com/watch/80057281',
    thumbnail: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=80',
    genre: 'Sci-Fi / Horror'
  },
  {
    netflixId: '81040344',
    title: 'Squid Game',
    url: 'https://www.netflix.com/watch/81040344',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    genre: 'Thriller / Drama'
  },
  {
    netflixId: '80211991',
    title: 'One Piece (Live Action)',
    url: 'https://www.netflix.com/watch/80211991',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    genre: 'Adventure / Fantasy'
  },
  {
    netflixId: '81231974',
    title: 'Wednesday',
    url: 'https://www.netflix.com/watch/81231974',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    genre: 'Mystery / Comedy'
  },
  {
    netflixId: '80192098',
    title: 'Money Heist (La Casa de Papel)',
    url: 'https://www.netflix.com/watch/80192098',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
    genre: 'Crime / Drama'
  },
  {
    netflixId: '81435684',
    title: 'Arcane: League of Legends',
    url: 'https://www.netflix.com/watch/81435684',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    genre: 'Cyberpunk Animation'
  }
];

export default function VideoContentPicker({ isOpen, onClose, onSetSubtitleCues, initialTab = 'youtube' }) {
  const { currentVideo, emitChangeVideo, startScreenShare } = useRoom();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [directUrl, setDirectUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  
  // YouTube State
  const [youtubeQuery, setYoutubeQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState(INITIAL_YOUTUBE_RESULTS);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [activeTag, setActiveTag] = useState('');

  // Netflix State
  const [netflixUrl, setNetflixUrl] = useState('');
  const [netflixTitle, setNetflixTitle] = useState('');
  
  // Local File State
  const [fileName, setFileName] = useState('');
  const [subtitleFileName, setSubtitleFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const searchTimeoutRef = useRef(null);

  const fetchYouTubeSearch = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setYoutubeResults(INITIAL_YOUTUBE_RESULTS);
      setIsSearchingYt(false);
      return;
    }

    setIsSearchingYt(true);
    setErrorMsg('');

    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const res = await fetch(`${serverUrl}/api/youtube/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.results && data.results.length > 0) {
        setYoutubeResults(data.results);
      } else {
        setYoutubeResults([]);
      }
    } catch (err) {
      console.warn('YouTube search API error:', err);
    } finally {
      setIsSearchingYt(false);
    }
  }, []);

  const handleYouTubeQueryChange = (val) => {
    setYoutubeQuery(val);
    setErrorMsg('');

    // Check if user pasted a direct YouTube link
    const ytId = parseYouTubeId(val);
    if (ytId) {
      return;
    }

    // Debounced search for keywords
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchYouTubeSearch(val);
    }, 450);
  };

  const handleSelectYouTubeVideo = (item) => {
    const ytId = item.youtubeId || item.id;
    emitChangeVideo({
      id: ytId,
      title: item.title,
      url: `https://www.youtube.com/watch?v=${ytId}`,
      youtubeId: ytId,
      type: 'youtube',
      duration: 0,
      thumbnail: item.thumbnail
    });
    onClose();
  };

  const handleApplyYouTubeSubmit = (e) => {
    e?.preventDefault();
    if (!youtubeQuery.trim()) return;

    const ytId = parseYouTubeId(youtubeQuery);
    if (ytId) {
      emitChangeVideo({
        id: ytId,
        title: customTitle.trim() || `YouTube Stream (${ytId})`,
        url: `https://www.youtube.com/watch?v=${ytId}`,
        youtubeId: ytId,
        type: 'youtube',
        duration: 0,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      });
      onClose();
      return;
    }

    // Otherwise trigger immediate search
    fetchYouTubeSearch(youtubeQuery);
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag.label);
    setYoutubeQuery(tag.query);
    fetchYouTubeSearch(tag.query);
  };

  const parseNetflixId = (url) => {
    if (!url) return null;
    const clean = url.trim();
    if (/^\d+$/.test(clean)) return clean;
    const match = clean.match(/watch\/(\d+)/) || clean.match(/title\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleSelectSample = (sample) => {
    emitChangeVideo(sample);
    onClose();
  };

  const handleApplyNetflix = (e) => {
    e?.preventDefault();
    const cleanUrl = netflixUrl.trim();
    if (!cleanUrl) {
      setErrorMsg('Please enter a Netflix watch link or Title ID');
      return;
    }

    const nId = parseNetflixId(cleanUrl);
    const finalUrl = nId ? `https://www.netflix.com/watch/${nId}` : cleanUrl;

    emitChangeVideo({
      id: nId ? `netflix-${nId}` : `netflix-${Date.now()}`,
      title: netflixTitle.trim() || (nId ? `Netflix Session #${nId}` : 'Netflix Co-Watch Party'),
      url: finalUrl,
      netflixId: nId || '',
      type: 'netflix',
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80'
    });
    onClose();
  };

  const handleSelectNetflixPreset = (preset) => {
    emitChangeVideo({
      id: `netflix-${preset.netflixId}`,
      title: preset.title,
      url: preset.url,
      netflixId: preset.netflixId,
      type: 'netflix',
      duration: 0,
      thumbnail: preset.thumbnail
    });
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    setFileName(file.name);

    emitChangeVideo({
      id: `local-${Date.now()}`,
      title: cleanTitle,
      url: fileUrl,
      type: 'local',
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
    });
    onClose();
  };

  const handleSubtitleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubtitleFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (text && onSetSubtitleCues) {
        const cues = parseSubtitles(text);
        onSetSubtitleCues(cues);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyDirectUrl = (e) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    emitChangeVideo({
      id: `custom-url-${Date.now()}`,
      title: customTitle.trim() || 'Direct Video Stream',
      url: directUrl.trim(),
      type: 'direct',
      duration: 0,
      thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
    });
    onClose();
  };

  const handleTriggerScreenShare = async () => {
    onClose();
    if (startScreenShare) {
      await startScreenShare();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#07111F]/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-5 sm:p-7 shadow-[0_20px_70px_rgba(37,99,235,0.35)] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-watchmate-text">
                  Cinema Stream Selector
                </h3>
                <p className="text-xs text-watchmate-secondaryText">
                  Search & stream YouTube, Netflix party, local gallery movies, or live screen share
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-watchmate-surface border border-watchmate-border mb-4 shrink-0 overflow-x-auto scrollbar-none">
            {/* 1. YouTube */}
            <button
              onClick={() => { setActiveTab('youtube'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-white" />
              <span>1. YouTube (Search & Live)</span>
            </button>

            {/* 2. Netflix */}
            <button
              onClick={() => { setActiveTab('netflix'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'netflix'
                  ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-red-400" />
              <span>2. Netflix Party</span>
            </button>

            {/* 3. Local Video / Gallery */}
            <button
              onClick={() => { setActiveTab('upload'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-watchmate-online" />
              <span>3. Local Gallery Movie</span>
            </button>

            {/* 4. Live Screen Share */}
            <button
              onClick={() => { setActiveTab('screen'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'screen'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span>Live Screen Share</span>
            </button>

            {/* 5. 4K Cinema Samples */}
            <button
              onClick={() => { setActiveTab('samples'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'samples'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-watchmate-gold" />
              <span>4K Samples</span>
            </button>

            {/* 6. Direct Link */}
            <button
              onClick={() => { setActiveTab('url'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'url'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-watchmate-brightBlue" />
              <span>Direct Link</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {/* ---------------- 1. YOUTUBE TAB (SEARCH & LIVE STREAM BROWSER) ---------------- */}
            {activeTab === 'youtube' && (
              <div className="space-y-4">
                {/* Search Bar & Direct Link Input */}
                <form onSubmit={handleApplyYouTubeSubmit} className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4 h-4 text-watchmate-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search YouTube videos, live streams, trailers, or paste any YouTube URL..."
                      value={youtubeQuery}
                      onChange={(e) => handleYouTubeQueryChange(e.target.value)}
                      className="w-full pl-11 pr-28 py-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border focus:border-red-500 text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/60 shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      {isSearchingYt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{parseYouTubeId(youtubeQuery) ? 'Stream Link' : 'Search'}</span>
                    </button>
                  </div>
                  {errorMsg && <p className="text-xs text-watchmate-error mt-2">{errorMsg}</p>}
                </form>

                {/* Quick Discovery Tags */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {YOUTUBE_QUICK_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        activeTag === tag.label
                          ? 'bg-red-600 text-white border-red-500 shadow-md'
                          : 'bg-watchmate-surface hover:bg-watchmate-elevated border-watchmate-border text-watchmate-secondaryText hover:text-white'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Results Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-watchmate-muted uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                      <span>{youtubeQuery ? `Results for "${youtubeQuery}"` : 'Featured Videos & Live Streams'}</span>
                    </h4>
                    {isSearchingYt && (
                      <span className="text-xs text-watchmate-cyan flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Searching YouTube...
                      </span>
                    )}
                  </div>

                  {youtubeResults.length === 0 && !isSearchingYt ? (
                    <div className="py-8 text-center bg-watchmate-surface/50 rounded-2xl border border-watchmate-border">
                      <p className="text-xs text-watchmate-muted">No videos found. Try a different search or paste a direct YouTube link.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {youtubeResults.map((item) => {
                        const isCurrent = currentVideo?.youtubeId === (item.youtubeId || item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectYouTubeVideo(item)}
                            className={`group relative rounded-xl overflow-hidden cursor-pointer border p-2.5 transition-all flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-red-950/30 border-red-500 shadow-md ring-1 ring-red-500'
                                : 'bg-watchmate-surface border-watchmate-border hover:border-red-500/50 hover:bg-watchmate-elevated'
                            }`}
                          >
                            <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                              <img 
                                src={item.thumbnail} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </div>
                              
                              {/* Live or Duration Badge */}
                              {item.isLive ? (
                                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-red-600 text-[10px] text-white font-bold flex items-center gap-1 animate-pulse shadow-md">
                                  <Radio className="w-2.5 h-2.5" />
                                  LIVE
                                </span>
                              ) : item.duration ? (
                                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-medium">
                                  {item.duration}
                                </span>
                              ) : null}
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-xs text-watchmate-text line-clamp-2 group-hover:text-red-400 transition-colors mb-1">
                                {item.title}
                              </h5>
                              <div className="flex items-center justify-between text-[10px] text-watchmate-muted">
                                <span className="truncate max-w-[120px]">{item.channel}</span>
                                <span>{item.views}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- 2. NETFLIX TAB ---------------- */}
            {activeTab === 'netflix' && (
              <div className="space-y-4">
                <form onSubmit={handleApplyNetflix} className="space-y-3 bg-watchmate-surface/50 p-4 rounded-2xl border border-red-900/30">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-watchmate-text flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-red-500" />
                      <span>Netflix Watch Link or Title ID</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://www.netflix.com/watch/80057281"
                      value={netflixUrl}
                      onChange={(e) => { setNetflixUrl(e.target.value); setErrorMsg(''); }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-watchmate-elevated border border-watchmate-border focus:border-red-500 text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/60"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
                    >
                      Start Party Sync
                    </button>
                  </div>
                  {errorMsg && <p className="text-xs text-watchmate-error">{errorMsg}</p>}
                  <p className="text-[11px] text-watchmate-secondaryText">
                    All participants with a Netflix subscription will synchronize playback timestamps and 3-2-1 countdowns!
                  </p>
                </form>

                <div>
                  <h4 className="text-xs font-semibold text-watchmate-muted uppercase tracking-wider mb-2.5">
                    Popular Netflix Shows & Movies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {NETFLIX_PRESETS.map((preset) => {
                      const isCurrent = currentVideo?.netflixId === preset.netflixId;
                      return (
                        <div
                          key={preset.netflixId}
                          onClick={() => handleSelectNetflixPreset(preset)}
                          className={`group relative rounded-xl overflow-hidden cursor-pointer border p-2.5 transition-all flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-red-950/30 border-red-500 shadow-md ring-1 ring-red-500'
                              : 'bg-watchmate-surface border-watchmate-border hover:border-red-500/50 hover:bg-watchmate-elevated'
                          }`}
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-black">
                            <img src={preset.thumbnail} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-red-400 font-bold">
                              NETFLIX
                            </span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-watchmate-text group-hover:text-red-400 transition-colors">
                              {preset.title}
                            </h5>
                            <span className="text-[10px] text-watchmate-muted">{preset.genre}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 3. LOCAL FILE / GALLERY TAB ---------------- */}
            {activeTab === 'upload' && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Video File Picker */}
                  <label className="border-2 border-dashed border-watchmate-border hover:border-watchmate-cyan rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-watchmate-elevated/40 hover:bg-watchmate-elevated text-center">
                    <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/10 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan mb-2.5">
                      <Film className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-sm text-watchmate-text mb-1">
                      Choose Downloaded Movie / Video
                    </h4>
                    <p className="text-[11px] text-watchmate-muted mb-3">
                      MP4, WebM, MKV, AVI, MOV from your gallery
                    </p>
                    <span className="btn-primary px-4 py-2 rounded-xl text-xs font-bold">
                      Browse Video File
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {fileName && (
                      <p className="text-xs text-watchmate-online font-semibold mt-2.5 truncate max-w-[200px]">
                        ✓ {fileName}
                      </p>
                    )}
                  </label>

                  {/* Subtitle File Picker */}
                  <label className="border-2 border-dashed border-watchmate-border hover:border-watchmate-gold rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-watchmate-elevated/40 hover:bg-watchmate-elevated text-center">
                    <div className="w-12 h-12 rounded-2xl bg-watchmate-gold/10 border border-watchmate-gold/30 flex items-center justify-center text-watchmate-gold mb-2.5">
                      <Subtitles className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-sm text-watchmate-text mb-1">
                      Add Subtitle File (Optional)
                    </h4>
                    <p className="text-[11px] text-watchmate-muted mb-3">
                      Upload .SRT or .VTT subtitles track
                    </p>
                    <span className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold">
                      Browse Subtitles
                    </span>
                    <input
                      type="file"
                      accept=".srt,.vtt,text/vtt"
                      onChange={handleSubtitleUpload}
                      className="hidden"
                    />
                    {subtitleFileName && (
                      <p className="text-xs text-watchmate-gold font-semibold mt-2.5 truncate max-w-[200px]">
                        ✓ {subtitleFileName}
                      </p>
                    )}
                  </label>
                </div>

                <div className="p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border text-xs text-watchmate-secondaryText space-y-1.5">
                  <div className="font-semibold text-watchmate-text flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-watchmate-cyan" />
                    <span>How Local Movie Sync Works:</span>
                  </div>
                  <p>• If all friends have the downloaded movie file, select it to play in 100% synchronized harmony with zero lag and zero buffering!</p>
                  <p>• Or use the <strong>Live Screen Share</strong> tab to broadcast your movie and sound directly to friends.</p>
                </div>
              </div>
            )}

            {/* ---------------- 4. SCREEN SHARE TAB ---------------- */}
            {activeTab === 'screen' && (
              <div className="py-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-4 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-lg text-watchmate-text mb-1">
                  Live Screen & Tab Streaming
                </h4>
                <p className="text-xs text-watchmate-secondaryText mb-5 leading-relaxed">
                  Stream your Netflix tab, local media player, or any browser window directly to your friends with high quality system audio.
                </p>
                <button
                  onClick={handleTriggerScreenShare}
                  className="btn-primary px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Start Live Screen Stream</span>
                </button>
                <p className="text-[10px] text-watchmate-muted mt-3">
                  Tip: When prompted by your browser, check <strong>"Also share tab audio"</strong> for full sound.
                </p>
              </div>
            )}

            {/* ---------------- 5. 4K SAMPLE LIBRARY TAB ---------------- */}
            {activeTab === 'samples' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SAMPLE_VIDEOS.map((sample) => {
                  const isCurrent = currentVideo?.id === sample.id || currentVideo?.url === sample.url;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all p-3 flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-gradient-to-b from-watchmate-primary/20 to-watchmate-surface border-watchmate-cyan shadow-[0_0_20px_rgba(56,189,248,0.3)] ring-1 ring-watchmate-cyan/50' 
                          : 'bg-watchmate-surface border-watchmate-border hover:border-watchmate-cyan/50 hover:bg-watchmate-elevated shadow-sm'
                      }`}
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black border border-watchmate-border">
                        <img 
                          src={sample.thumbnail} 
                          alt={sample.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-watchmate-gold text-black text-[10px] font-bold flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" />
                            Playing
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-watchmate-text line-clamp-1 mb-1 group-hover:text-watchmate-cyan transition-colors">
                          {sample.title}
                        </h4>
                        <p className="text-xs text-watchmate-secondaryText line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------- 6. DIRECT URL TAB ---------------- */}
            {activeTab === 'url' && (
              <form onSubmit={handleApplyDirectUrl} className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                    Direct Video Stream URL (MP4 / WebM / HLS)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/movie.mp4"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border focus:border-watchmate-cyan text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/60"
                  />
                  <p className="text-[11px] text-watchmate-muted mt-1.5">
                    Works with any publicly accessible MP4, WebM, or direct CDN video streaming link.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                    Video Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Custom Stream"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border focus:border-watchmate-cyan text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/60"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold shadow-lg transition-all"
                >
                  Load Direct Video
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
