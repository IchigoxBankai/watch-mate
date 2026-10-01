import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, PhoneCall, Smile, LogOut, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useRoom } from '../../context/RoomContext';
import { useVoice } from '../../context/VoiceContext';
import ParticipantsPanel from './ParticipantsPanel';
import VoiceControl from './VoiceControl';
import ChatPanel from './ChatPanel';
import { QuickReactionButtons } from './ReactionLayer';

export default function MobileDrawer() {
  const [activeTab, setActiveTab] = useState(null);
  const { unreadCount } = useChat();
  const { participants, leaveRoom } = useRoom();
  const { isVoiceConnected, isSpeakingLocally } = useVoice();
  const navigate = useNavigate();

  const toggleTab = (tab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/home');
  };

  return (
    <>
      {/* Mobile Bottom Floating Dock with Deep Blue Styling */}
      <div className="lg:hidden fixed bottom-3 inset-x-3 z-30 flex items-center justify-between p-2 rounded-2xl bg-watchmate-elevated/95 backdrop-blur-xl border border-watchmate-border shadow-2xl">
        {/* Participants */}
        <button
          onClick={() => toggleTab('participants')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'participants' ? 'text-watchmate-cyan bg-watchmate-surface' : 'text-watchmate-muted'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4" />
            <span className="absolute -top-1 -right-2 text-[9px] font-bold text-watchmate-cyan">
              {participants.length}
            </span>
          </div>
          <span className="mt-1">Lounge</span>
        </button>

        {/* Voice */}
        <button
          onClick={() => toggleTab('voice')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'voice' ? 'text-watchmate-cyan bg-watchmate-surface' : 'text-watchmate-muted'
          }`}
        >
          <div className="relative">
            <PhoneCall className="w-4 h-4" />
            {isVoiceConnected && (
              <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isSpeakingLocally ? 'bg-watchmate-cyan animate-ping' : 'bg-watchmate-online'}`} />
            )}
          </div>
          <span className="mt-1">Voice</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => toggleTab('chat')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'chat' ? 'text-watchmate-cyan bg-watchmate-surface' : 'text-watchmate-muted'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 rounded-full btn-primary text-[8px] text-white font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="mt-1">Chat</span>
        </button>

        {/* Reactions */}
        <button
          onClick={() => toggleTab('reactions')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-medium transition-all ${
            activeTab === 'reactions' ? 'text-watchmate-cyan bg-watchmate-surface' : 'text-watchmate-muted'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span className="mt-1">React</span>
        </button>

        {/* Leave Room Button */}
        <button
          onClick={handleLeave}
          className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all cursor-pointer"
          title="Leave Watch Room"
        >
          <LogOut className="w-4 h-4" />
          <span className="mt-1">Leave</span>
        </button>
      </div>

      {/* Slide-up Bottom Sheet */}
      <AnimatePresence>
        {activeTab && (
          <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setActiveTab(null)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full bg-watchmate-surface border-t border-watchmate-border rounded-t-3xl p-5 max-h-[75vh] flex flex-col shadow-2xl mb-16"
            >
              {/* Sheet Handle */}
              <div className="w-12 h-1 bg-watchmate-border rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-watchmate-muted font-bold">
                  {activeTab}
                </span>
                <button
                  onClick={() => setActiveTab(null)}
                  className="p-1.5 rounded-full text-watchmate-muted hover:text-watchmate-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pb-2">
                {activeTab === 'participants' && <ParticipantsPanel />}
                {activeTab === 'voice' && <VoiceControl />}
                {activeTab === 'chat' && <ChatPanel />}
                {activeTab === 'reactions' && (
                  <div className="py-4 flex justify-center">
                    <QuickReactionButtons />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
