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
  Monitor, 
  Subtitles,
  Search,
  Radio,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { parseSubtitles } from '../room/SubtitlesOverlay';
import { uploadVideoFile, validateVideoFile } from '../../services/videoUploadService';

export const parseYouTubeId = (url) => {
  if (!url) return null;
  const clean = url.trim();

  // 11-char alphanumeric ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // /live/ID
  const liveMatch = clean.match(/(?:youtube\.com\/live\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  // /shorts/ID
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // youtu.be/ID
  const youtuBeMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch) return youtuBeMatch[1];

  // watch?v=ID or &v=ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // embed/ID
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

export default function MediaSelector({ isOpen, onClose, onSetSubtitleCues, initialTab = 'youtube' }) {
  const { currentVideo, emitChangeVideo, startScreenShare, showToast } = useRoom();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [directUrl, setDirectUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // YouTube State
  const [youtubeQuery, setYoutubeQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState(INITIAL_YOUTUBE_RESULTS);
  const [isSearchingYt, setIsSearchingYt] = useState(false);
  const [activeTag, setActiveTag] = useState('');

  // Local Video Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [subtitleFileName, setSubtitleFileName] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // YouTube Search Query Handler
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
      console.warn('[MediaSelector] YouTube search API error:', err);
    } finally {
      setIsSearchingYt(false);
    }
  }, []);

  const handleYouTubeQueryChange = (val) => {
    setYoutubeQuery(val);
    setErrorMsg('');

    const ytId = parseYouTubeId(val);
    if (ytId) {
      return;
    }

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
    showToast(`Loaded YouTube: ${item.title}`, 'info');
    onClose();
  };

  const handleApplyYouTubeSubmit = (e) => {
    e?.preventDefault();
    if (!youtubeQuery.trim()) return;

    const ytId = parseYouTubeId(youtubeQuery);
    if (ytId) {
      emitChangeVideo({
        id: ytId,
        title: customTitle.trim() || `YouTube (${ytId})`,
        url: `https://www.youtube.com/watch?v=${ytId}`,
        youtubeId: ytId,
        type: 'youtube',
        duration: 0,
        thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      });
      showToast('Loaded YouTube stream to room', 'info');
      onClose();
      return;
    }

    fetchYouTubeSearch(youtubeQuery);
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag.label);
    setYoutubeQuery(tag.query);
    fetchYouTubeSearch(tag.query);
  };

  // Local File Upload Handler
  const handleLocalVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }

    setErrorMsg('');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);

    try {
      const result = await uploadVideoFile(file, (percent) => {
        setUploadProgress(percent);
      });

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      
      emitChangeVideo({
        id: `local-${Date.now()}`,
        title: cleanTitle,
        url: result.url,
        fileName: file.name,
        type: 'local',
        duration: 0,
        uploadedBy: currentUser?.id,
        thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'
      });

      showToast(`Uploaded "${file.name}" to WatchMate Room!`, 'success');
      onClose();
    } catch (err) {
      console.error('[MediaSelector] Upload error:', err);
      setErrorMsg(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
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

  const handleSelectSample = (sample) => {
    emitChangeVideo(sample);
    showToast(`Loaded sample: ${sample.title}`, 'info');
    onClose();
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
    showToast('Loaded direct video stream', 'info');
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
                  Media Source Selector
                </h3>
                <p className="text-xs text-watchmate-secondaryText">
                  Stream synchronized YouTube, uploaded local movies, or share your live screen
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-watchmate-muted hover:text-watchmate-text hover:bg-watchmate-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-watchmate-surface border border-watchmate-border mb-4 shrink-0 overflow-x-auto scrollbar-none">
            {/* 1. YouTube */}
            <button
              onClick={() => { setActiveTab('youtube'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-white" />
              <span>1. YouTube</span>
            </button>

            {/* 2. Local Video Upload */}
            <button
              onClick={() => { setActiveTab('upload'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-watchmate-online" />
              <span>2. Local Video</span>
            </button>

            {/* 3. Screen Share */}
            <button
              onClick={() => { setActiveTab('screen'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'screen'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-watchmate-cyan" />
              <span>3. Screen Share</span>
            </button>

            {/* 4. 4K Cinema Samples */}
            <button
              onClick={() => { setActiveTab('samples'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'samples'
                  ? 'bg-gradient-to-r from-watchmate-primary to-watchmate-cyan text-white shadow-md'
                  : 'text-watchmate-secondaryText hover:text-white hover:bg-watchmate-elevated'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-watchmate-gold" />
              <span>4K Samples</span>
            </button>

            {/* 5. Direct Link */}
            <button
              onClick={() => { setActiveTab('url'); setErrorMsg(''); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
            {/* ---------------- 1. YOUTUBE TAB ---------------- */}
            {activeTab === 'youtube' && (
              <div className="space-y-4">
                {/* Paste URL / Search Box */}
                <form onSubmit={handleApplyYouTubeSubmit} className="space-y-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4 h-4 text-watchmate-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...) or search titles..."
                      value={youtubeQuery}
                      onChange={(e) => handleYouTubeQueryChange(e.target.value)}
                      className="w-full pl-11 pr-32 py-3 rounded-2xl bg-watchmate-elevated border border-watchmate-border focus:border-red-500 text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted/60 shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSearchingYt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{parseYouTubeId(youtubeQuery) ? 'Add to Room' : 'Search'}</span>
                    </button>
                  </div>
                  {errorMsg && <p className="text-xs text-watchmate-error mt-1">{errorMsg}</p>}
                </form>

                {/* Quick Discovery Tags */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {YOUTUBE_QUICK_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
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
                      <p className="text-xs text-watchmate-muted">No videos found. Try a different search query or paste a direct YouTube URL.</p>
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

            {/* ---------------- 2. LOCAL VIDEO UPLOAD TAB ---------------- */}
            {activeTab === 'upload' && (
              <div className="space-y-4 py-2">
                {isUploading ? (
                  <div className="border-2 border-watchmate-cyan/40 bg-watchmate-elevated/80 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                      <Upload className="w-7 h-7 animate-bounce" />
                    </div>
                    <h4 className="font-display font-bold text-base text-watchmate-text mb-1">
                      Uploading "{uploadedFileName}"
                    </h4>
                    <p className="text-xs text-watchmate-secondaryText mb-4 max-w-sm">
                      Uploading to shared cloud storage so every participant gets high-speed synchronized playback.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md h-3 bg-watchmate-border rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-watchmate-primary via-blue-500 to-watchmate-cyan transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-watchmate-cyan">
                      {uploadProgress}% Complete
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Video File Picker */}
                    <label className="border-2 border-dashed border-watchmate-border hover:border-watchmate-cyan rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-watchmate-elevated/40 hover:bg-watchmate-elevated text-center">
                      <div className="w-12 h-12 rounded-2xl bg-watchmate-cyan/10 border border-watchmate-cyan/30 flex items-center justify-center text-watchmate-cyan mb-2.5">
                        <Film className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-sm text-watchmate-text mb-1">
                        Choose Video File
                      </h4>
                      <p className="text-[11px] text-watchmate-muted mb-3">
                        .mp4, .webm, .mov, .mkv (up to 1 GB)
                      </p>
                      <span className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                        Browse Video File
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv"
                        onChange={handleLocalVideoUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Subtitle File Picker */}
                    <label className="border-2 border-dashed border-watchmate-border hover:border-watchmate-gold rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-watchmate-elevated/40 hover:bg-watchmate-elevated text-center">
                      <div className="w-12 h-12 rounded-2xl bg-watchmate-gold/10 border border-watchmate-gold/30 flex items-center justify-center text-watchmate-gold mb-2.5">
                        <Subtitles className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-sm text-watchmate-text mb-1">
                        Add Subtitles (Optional)
                      </h4>
                      <p className="text-[11px] text-watchmate-muted mb-3">
                        Upload .SRT or .VTT subtitles file
                      </p>
                      <span className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold shadow-md">
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
                )}

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-watchmate-error/15 border border-watchmate-error/30 text-xs text-watchmate-error flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-watchmate-surface border border-watchmate-border text-xs text-watchmate-secondaryText space-y-1.5">
                  <div className="font-semibold text-watchmate-text flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-watchmate-online" />
                    <span>True Synchronized Local Playback:</span>
                  </div>
                  <p>• Your video is uploaded securely and shared with the room.</p>
                  <p>• Every participant's browser independently renders the crystal-clear video with 100% native quality, perfectly synced with the host controls!</p>
                </div>
              </div>
            )}

            {/* ---------------- 3. SCREEN SHARE TAB ---------------- */}
            {activeTab === 'screen' && (
              <div className="py-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-watchmate-cyan/15 border border-watchmate-cyan/35 flex items-center justify-center text-watchmate-cyan mb-4 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-lg text-watchmate-text mb-1">
                  Live Screen & Tab Streaming
                </h4>
                <p className="text-xs text-watchmate-secondaryText mb-5 leading-relaxed">
                  Stream any browser tab, desktop app, or full screen directly to everyone via ultra-low latency WebRTC.
                </p>
                <button
                  onClick={handleTriggerScreenShare}
                  className="btn-primary px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Start Live Screen Share</span>
                </button>
                <p className="text-[11px] text-watchmate-muted mt-3">
                  Tip: When prompted by your browser, check <strong>"Also share tab audio"</strong> for full audio.
                </p>
              </div>
            )}

            {/* ---------------- 4. 4K SAMPLES TAB ---------------- */}
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

            {/* ---------------- 5. DIRECT URL TAB ---------------- */}
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
                  className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold shadow-lg transition-all cursor-pointer"
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
