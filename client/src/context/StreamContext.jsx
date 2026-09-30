import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { useRoom } from './RoomContext';

const StreamContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function StreamProvider({ children }) {
  const { currentUser } = useAuth();
  const { roomId, room, participants, currentVideo } = useRoom();

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [streamInfo, setStreamInfo] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // targetSocketId -> RTCPeerConnection
  const socket = socketService.getSocket();

  const isHost = room?.hostId === currentUser?.id;

  // Create Peer Connection for sending or receiving stream
  const createStreamPeerConnection = useCallback((targetSocketId, isInitiator = false) => {
    // If peer connection already exists, close old one
    const existing = peerConnectionsRef.current.get(targetSocketId);
    if (existing) {
      existing.close();
      peerConnectionsRef.current.delete(targetSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // If we are broadcasting, add local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('stream:signal', {
          targetSocketId,
          signal: { type: 'candidate', candidate: event.candidate },
          fromUserId: currentUser?.id
        });
      }
    };

    // When remote track arrives on viewer's device
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStream(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetSocketId);
      }
    };

    peerConnectionsRef.current.set(targetSocketId, pc);
    return pc;
  }, [socket, currentUser]);

  // Host starts broadcasting a MediaStream (from local video capture or screen)
  const startBroadcast = useCallback(async (mediaStream, streamType = 'local_video', title = '') => {
    if (!roomId || !mediaStream) return;

    localStreamRef.current = mediaStream;
    setIsBroadcasting(true);
    setStreamInfo({ streamType, title });

    // Inform server that broadcast has started
    socket.emit('stream:start_broadcast', { roomId, streamType, title });

    // Connect to all other participants currently in room
    participants.forEach(async (p) => {
      if (p.id !== currentUser?.id && p.socketId) {
        const pc = createStreamPeerConnection(p.socketId, true);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
          });
          await pc.setLocalDescription(offer);
          socket.emit('stream:signal', {
            targetSocketId: p.socketId,
            signal: offer,
            fromUserId: currentUser?.id
          });
        } catch (err) {
          console.warn('[StreamBroadcaster] Failed to create offer for peer:', p.name, err);
        }
      }
    });
  }, [roomId, socket, currentUser, participants, createStreamPeerConnection]);

  // Stop broadcasting
  const stopBroadcast = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current = null;
    }

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    setIsBroadcasting(false);
    setStreamInfo(null);

    if (roomId && socket) {
      socket.emit('stream:stop_broadcast', { roomId });
    }
  }, [roomId, socket]);

  // Guest requests stream from host
  const requestStreamFromHost = useCallback(() => {
    if (roomId && socket && !isHost) {
      socket.emit('stream:request_stream', { roomId });
    }
  }, [roomId, socket, isHost]);

  // Handle Socket Events for WebRTC stream
  useEffect(() => {
    if (!socket) return;

    // A viewer asked for the stream
    const handleStreamRequested = async ({ requesterSocketId }) => {
      if (localStreamRef.current && requesterSocketId) {
        const pc = createStreamPeerConnection(requesterSocketId, true);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
          });
          await pc.setLocalDescription(offer);
          socket.emit('stream:signal', {
            targetSocketId: requesterSocketId,
            signal: offer,
            fromUserId: currentUser?.id
          });
        } catch (err) {
          console.warn('[StreamBroadcaster] Failed offer on request:', err);
        }
      }
    };

    // Broadcast started event
    const handleBroadcastStarted = ({ streamType, title }) => {
      setStreamInfo({ streamType, title });
      requestStreamFromHost();
    };

    // Broadcast stopped event
    const handleBroadcastStopped = () => {
      setRemoteStream(null);
      setStreamInfo(null);
      peerConnectionsRef.current.forEach(pc => pc.close());
      peerConnectionsRef.current.clear();
    };

    // Signal received (Offer / Answer / ICE Candidate)
    const handleStreamSignal = async ({ callerSocketId, signal, fromUserId }) => {
      let pc = peerConnectionsRef.current.get(callerSocketId);

      try {
        if (signal.type === 'offer') {
          pc = createStreamPeerConnection(callerSocketId, false);
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('stream:signal', {
            targetSocketId: callerSocketId,
            signal: answer,
            fromUserId: currentUser?.id
          });
        } else if (signal.type === 'answer') {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
          }
        } else if (signal.candidate) {
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.warn('[StreamViewer] Signaling error:', err);
      }
    };

    socket.on('stream:stream_requested', handleStreamRequested);
    socket.on('stream:broadcast_started', handleBroadcastStarted);
    socket.on('stream:broadcast_stopped', handleBroadcastStopped);
    socket.on('stream:signal', handleStreamSignal);

    return () => {
      socket.off('stream:stream_requested', handleStreamRequested);
      socket.off('stream:broadcast_started', handleBroadcastStarted);
      socket.off('stream:broadcast_stopped', handleBroadcastStopped);
      socket.off('stream:signal', handleStreamSignal);
    };
  }, [socket, currentUser, createStreamPeerConnection, requestStreamFromHost]);

  // Request stream automatically when a guest joins a room where a local/screen stream is playing
  useEffect(() => {
    if (currentVideo && (currentVideo.type === 'local' || currentVideo.type === 'screen_share') && !isHost) {
      requestStreamFromHost();
    }
  }, [currentVideo, isHost, requestStreamFromHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast();
    };
  }, [stopBroadcast]);

  const value = {
    isBroadcasting,
    remoteStream,
    streamInfo,
    startBroadcast,
    stopBroadcast,
    requestStreamFromHost
  };

  return (
    <StreamContext.Provider value={value}>
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
}
