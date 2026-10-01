import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, LogIn, Home, ArrowLeft } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import RoomHeader from '../components/room/RoomHeader';
import MediaPlayer from '../components/media/MediaPlayer';
import ParticipantsPanel from '../components/room/ParticipantsPanel';
import VoiceControl from '../components/room/VoiceControl';
import ChatPanel from '../components/room/ChatPanel';
import MobileDrawer from '../components/room/MobileDrawer';
import LoadingScreen from '../components/LoadingScreen';

export default function WatchRoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, loading: authLoading, loginAsGuest } = useAuth();
  const { joinRoom, isJoining, joinStep, room, roomNotFound, emitChangeVideo } = useRoom();

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!roomId) {
      navigate('/home');
      return;
    }

    let user = currentUser;
    if (!user) {
      user = loginAsGuest();
    }

    joinRoom(roomId, user, {
      isCreator: location.state?.isCreator,
      roomName: location.state?.roomName,
      settings: location.state?.settings
    });
    setInitialCheckDone(true);

    if (location.state?.initialVideo) {
      setTimeout(() => {
        emitChangeVideo(location.state.initialVideo);
      }, 800);
    }
  }, [roomId, authLoading]);

  // If Room does not exist (wrong code entered)
  if (roomNotFound) {
    return (
      <div className="min-h-screen bg-watchmate-bg text-watchmate-text flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(239,68,68,0.2)]"
        >
          <div className="w-16 h-16 rounded-2xl bg-watchmate-error/15 border border-watchmate-error/40 flex items-center justify-center text-watchmate-error mx-auto mb-5 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="font-display font-extrabold text-2xl text-watchmate-text mb-2">
            Room Doesn't Exist
          </h2>
          <p className="text-xs sm:text-sm text-watchmate-secondaryText max-w-xs mx-auto leading-relaxed mb-6">
            We couldn't find a watch room with code <strong className="font-mono text-watchmate-gold">#{roomId?.toUpperCase()}</strong>. Check the room code with your host or create your own room.
          </p>

          <div className="space-y-3">
            <Link
              to="/join"
              className="w-full btn-primary py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <LogIn className="w-4 h-4" />
              <span>Enter Another Room Code</span>
            </Link>

            <Link
              to="/create"
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-watchmate-text bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-watchmate-cyan" />
              <span>Create a New Room</span>
            </Link>

            <Link
              to="/home"
              className="w-full py-2.5 text-xs text-watchmate-muted hover:text-watchmate-text transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isJoining || !initialCheckDone) {
    return <LoadingScreen message={joinStep || "Getting everyone together..."} />;
  }

  return (
    <div className="min-h-screen bg-watchmate-bg text-watchmate-text flex flex-col overflow-x-hidden">
      {/* Subtle Blue Atmospheric Ambient Lighting */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[650px] bg-watchmate-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-watchmate-cyan/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Watch Room Top Header */}
      <RoomHeader />

      {/* Main Digital Lounge Layout */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-24 lg:pb-6">
        {/* Left Column: Cinematic Video Stage (8 of 12 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <MediaPlayer />
        </div>

        {/* Right Column: Social Lounge Panel (4 of 12 cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 sticky top-20 max-h-[calc(100vh-6rem)]">
          {/* WebRTC Voice Lounge Controls */}
          <VoiceControl />

          {/* Participants in Lounge */}
          <ParticipantsPanel />

          {/* Real-time Text Chat */}
          <ChatPanel />
        </div>
      </main>

      {/* Mobile Bottom Sheets & Navigation Dock */}
      <MobileDrawer />
    </div>
  );
}
