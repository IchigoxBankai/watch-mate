import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { useRoom } from './RoomContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const { roomId, room } = useRoom();

  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const socket = socketService.getSocket();

  // Reset messages when room changes
  useEffect(() => {
    if (room && room.messages) {
      setMessages(room.messages);
    } else {
      setMessages([]);
    }
  }, [room]);

  // Handle incoming messages and reactions
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleReactionReceived = (reaction) => {
      setReactions(prev => [...prev, reaction]);

      // Remove after animation completes
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    };

    socket.on('chat:new_message', handleNewMessage);
    socket.on('reaction:received', handleReactionReceived);

    return () => {
      socket.off('chat:new_message', handleNewMessage);
      socket.off('reaction:received', handleReactionReceived);
    };
  }, [socket, isChatOpen]);

  // Send Chat Message
  const sendMessage = useCallback((text) => {
    if (!text?.trim() || !roomId || !currentUser) return;

    const payload = {
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || '',
      text: text.trim()
    };

    socket.emit('chat:send_message', { roomId, message: payload });
  }, [socket, roomId, currentUser]);

  // Send Floating Emoji Reaction
  const sendReaction = useCallback((emoji) => {
    if (!roomId) return;

    // Random horizontal position (15% to 85%)
    const xPos = Math.floor(Math.random() * 70) + 15;

    socket.emit('reaction:send', {
      roomId,
      reaction: { emoji, xPos }
    });
  }, [socket, roomId]);

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  };

  const value = {
    messages,
    reactions,
    unreadCount,
    isChatOpen,
    sendMessage,
    sendReaction,
    openChat,
    closeChat,
    toggleChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
