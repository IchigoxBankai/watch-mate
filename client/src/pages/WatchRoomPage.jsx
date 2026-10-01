import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { joinRoom, isJoining, joinStep, room, emitChangeVideo } = useRoom();

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

    joinRoom(roomId, user);
    setInitialCheckDone(true);

    if (location.state?.initialVideo) {
      setTimeout(() => {
        emitChangeVideo(location.state.initialVideo);
      }, 800);
    }
  }, [roomId, authLoading]);

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
