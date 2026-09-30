import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';

const RoomContext = createContext(null);

const SYNC_TOLERANCE_SECONDS = 0.3; // 300ms tolerance

export function RoomProvider({ children }) {
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentTime: 0,
    lastUpdatedAt: Date.now(),
    playbackRate: 1.0,
    updatedBy: ''
  });
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'disconnected'
  const [toastNotification, setToastNotification] = useState(null);
  const [countdownState, setCountdownState] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isContentPickerOpen, setIsContentPickerOpen] = useState(false);
  const [pickerInitialTab, setPickerInitialTab] = useState('youtube');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStep, setJoinStep] = useState(''); // 'Connecting...', 'Finding everyone...', 'You\'re in.'
  const [error, setError] = useState(null);

  const socket = socketService.getSocket();
  const isSyncingRef = useRef(false);

  const openContentPicker = useCallback((tab = 'youtube') => {
    setPickerInitialTab(tab);
    setIsContentPickerOpen(true);
  }, []);

  const closeContentPicker = useCallback(() => {
    setIsContentPickerOpen(false);
  }, []);

  // Clear toast after 3 seconds
  const showToast = useCallback((message, type = 'info') => {
    setToastNotification({ id: Date.now(), message, type });
    setTimeout(() => {
      setToastNotification(prev => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // Actions for playback & room control
  const emitPlay = useCallback((currentTime) => {
    if (!roomId) return;
    setPlayback(prev => ({ ...prev, isPlaying: true, currentTime, lastUpdatedAt: Date.now() }));
    socket.emit('sync:play', { roomId, currentTime });
  }, [socket, roomId]);

  const emitPause = useCallback((currentTime) => {
    if (!roomId) return;
    setPlayback(prev => ({ ...prev, isPlaying: false, currentTime, lastUpdatedAt: Date.now() }));
    socket.emit('sync:pause', { roomId, currentTime });
  }, [socket, roomId]);

  const emitSeek = useCallback((currentTime) => {
    if (!roomId) return;
    setPlayback(prev => ({ ...prev, currentTime, lastUpdatedAt: Date.now() }));
    socket.emit('sync:seek', { roomId, currentTime });
  }, [socket, roomId]);

  const emitPlaybackRate = useCallback((rate) => {
    if (!roomId) return;
    setPlayback(prev => ({ ...prev, playbackRate: rate }));
    socket.emit('sync:rate', { roomId, rate });
  }, [socket, roomId]);

  const emitCountdown = useCallback(({ count = 3, message = 'Starting in' }) => {
    if (!roomId) return;
    socket.emit('sync:countdown', { roomId, count, message });
  }, [socket, roomId]);

  const emitChangeVideo = useCallback((videoData) => {
    if (!roomId) return;
    socket.emit('sync:change_video', { roomId, videoData });
  }, [socket, roomId]);

  const emitUpdateSettings = useCallback((settings) => {
    if (!roomId) return;
    socket.emit('room:update_settings', { roomId, settings });
  }, [socket, roomId]);

  const emitKickParticipant = useCallback((targetUserId) => {
    if (!roomId) return;
    socket.emit('room:kick_participant', { roomId, targetUserId });
  }, [socket, roomId]);

  // Join Room flow
  const joinRoom = useCallback(async (targetRoomId, user) => {
    if (!targetRoomId || !user) return;
    const cleanId = targetRoomId.trim().toLowerCase();
    
    setIsJoining(true);
    setError(null);
    setJoinStep('Connecting to room...');

    setTimeout(() => {
      setJoinStep('Finding everyone...');
    }, 400);

    socket.emit('room:join', { roomId: cleanId, user });
    setRoomId(cleanId);
  }, [socket]);

  // Leave Room
  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('room:leave');
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }
    setRoomId(null);
    setRoom(null);
    setParticipants([]);
    setCurrentVideo(null);
    setIsJoining(false);
  }, [socket, roomId, screenStream]);

  // Screen Sharing
  const stopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    showToast('Screen sharing stopped', 'info');
  }, [screenStream, showToast]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Listen for when user stops sharing via browser bar
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Set video mode to screen share
      emitChangeVideo({
        id: `screen-${Date.now()}`,
        title: 'Live Screen Broadcast',
        url: '',
        type: 'screen_share',
        duration: 0,
        thumbnail: ''
      });

      showToast('Screen sharing started with audio', 'success');
      return stream;
    } catch (err) {
      console.warn('Screen share error:', err);
      if (err.name !== 'NotAllowedError') {
        showToast('Could not start screen share', 'error');
      }
      return null;
    }
  }, [emitChangeVideo, stopScreenShare, showToast]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Initial state received from server
    const handleInitialState = (state) => {
      setRoom(state);
      setParticipants(state.participants || []);
      setCurrentVideo(state.currentVideo || null);
      if (state.playback) {
        setPlayback(state.playback);
      }
      setJoinStep("You're in.");
      setTimeout(() => {
        setIsJoining(false);
      }, 500);
      setSyncStatus('synced');
    };

    // Participant joined
    const handleParticipantJoined = ({ participant }) => {
      setParticipants(prev => {
        if (prev.some(p => p.id === participant.id)) return prev;
        return [...prev, participant];
      });
      showToast(`${participant.name} joined the room`, 'info');
    };

    // Participant left
    const handleParticipantLeft = ({ userId, name, newHostId }) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
      if (newHostId) {
        setRoom(prev => prev ? { ...prev, hostId: newHostId } : prev);
      }
      showToast(`${name} left the room`, 'info');
    };

    // Playback Play
    const handleSyncPlay = ({ currentTime, updatedBy }) => {
      isSyncingRef.current = true;
      setPlayback(prev => ({
        ...prev,
        isPlaying: true,
        currentTime,
        lastUpdatedAt: Date.now(),
        updatedBy
      }));
      setSyncStatus('synced');
      setTimeout(() => { isSyncingRef.current = false; }, 300);
    };

    // Playback Pause
    const handleSyncPause = ({ currentTime, updatedBy }) => {
      isSyncingRef.current = true;
      setPlayback(prev => ({
        ...prev,
        isPlaying: false,
        currentTime,
        lastUpdatedAt: Date.now(),
        updatedBy
      }));
      setSyncStatus('synced');
      setTimeout(() => { isSyncingRef.current = false; }, 300);
    };

    // Playback Seek
    const handleSyncSeek = ({ currentTime, isPlaying, updatedBy }) => {
      isSyncingRef.current = true;
      setPlayback(prev => ({
        ...prev,
        currentTime,
        isPlaying: isPlaying !== undefined ? isPlaying : prev.isPlaying,
        lastUpdatedAt: Date.now(),
        updatedBy
      }));
      setSyncStatus('synced');
      setTimeout(() => { isSyncingRef.current = false; }, 300);
    };

    // Playback Rate
    const handleSyncRate = ({ rate }) => {
      setPlayback(prev => ({ ...prev, playbackRate: rate }));
    };

    // Video Changed
    const handleVideoChanged = ({ video, playback: newPlayback, updatedBy }) => {
      setCurrentVideo(video);
      setPlayback(newPlayback);
      showToast(`${updatedBy} loaded "${video.title}"`, 'info');
    };

    // Countdown sync
    const handleCountdown = (data) => {
      setCountdownState(data);
    };

    // Settings Updated
    const handleSettingsUpdated = (settings) => {
      setRoom(prev => prev ? { ...prev, settings } : prev);
      showToast('Room settings updated', 'info');
    };

    // Toast from server
    const handleServerToast = ({ message, type }) => {
      showToast(message, type);
    };

    // Room Error
    const handleRoomError = ({ message }) => {
      setError(message);
      setIsJoining(false);
      showToast(message, 'error');
    };

    // Kicked
    const handleKicked = ({ message }) => {
      leaveRoom();
      setError(message);
      showToast(message, 'error');
    };

    socket.on('room:initial_state', handleInitialState);
    socket.on('room:participant_joined', handleParticipantJoined);
    socket.on('room:participant_left', handleParticipantLeft);
    socket.on('sync:play', handleSyncPlay);
    socket.on('sync:pause', handleSyncPause);
    socket.on('sync:seek', handleSyncSeek);
    socket.on('sync:rate', handleSyncRate);
    socket.on('sync:countdown', handleCountdown);
    socket.on('sync:video_changed', handleVideoChanged);
    socket.on('room:settings_updated', handleSettingsUpdated);
    socket.on('room:toast', handleServerToast);
    socket.on('room:error', handleRoomError);
    socket.on('room:kicked', handleKicked);

    return () => {
      socket.off('room:initial_state', handleInitialState);
      socket.off('room:participant_joined', handleParticipantJoined);
      socket.off('room:participant_left', handleParticipantLeft);
      socket.off('sync:play', handleSyncPlay);
      socket.off('sync:pause', handleSyncPause);
      socket.off('sync:seek', handleSyncSeek);
      socket.off('sync:rate', handleSyncRate);
      socket.off('sync:countdown', handleCountdown);
      socket.off('sync:video_changed', handleVideoChanged);
      socket.off('room:settings_updated', handleSettingsUpdated);
      socket.off('room:toast', handleServerToast);
      socket.off('room:error', handleRoomError);
      socket.off('room:kicked', handleKicked);
    };
  }, [socket, showToast, leaveRoom]);

  const value = {
    roomId,
    room,
    participants,
    currentVideo,
    playback,
    syncStatus,
    isJoining,
    joinStep,
    error,
    toastNotification,
    countdownState,
    screenStream,
    isScreenSharing,
    isContentPickerOpen,
    pickerInitialTab,
    isSyncingRef,
    joinRoom,
    leaveRoom,
    startScreenShare,
    stopScreenShare,
    openContentPicker,
    closeContentPicker,
    setIsContentPickerOpen,
    setPickerInitialTab,
    emitPlay,
    emitPause,
    emitSeek,
    emitPlaybackRate,
    emitCountdown,
    emitChangeVideo,
    emitUpdateSettings,
    emitKickParticipant,
    showToast,
    setSyncStatus,
    setCountdownState
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
