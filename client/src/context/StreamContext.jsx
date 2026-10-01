import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { useRoom } from './RoomContext';

const StreamContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
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
  const candidateQueueRef = useRef(new Map()); // socketId -> RTCIceCandidateInit[]
  const socket = socketService.getSocket();

  const isHost = room?.hostId === currentUser?.id;

  // Create Peer Connection for sending or receiving stream
  const createStreamPeerConnection = useCallback((targetSocketId) => {
    // Clean up previous connection if any
    const existing = peerConnectionsRef.current.get(targetSocketId);
    if (existing) {
      try { existing.close(); } catch (e) {}
      peerConnectionsRef.current.delete(targetSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // If host is broadcasting, add local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    } else {
      // Receiver specifies recvonly transceivers for video and audio
      try {
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });
      } catch (e) {}
    }

    // ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('stream:signal', {
          targetSocketId,
          signal: { type: 'candidate', candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate },
          fromUserId: currentUser?.id
        });
      }
    };

    // When remote track arrives on viewer's device
    pc.ontrack = (event) => {
      console.log('[StreamContext] Remote stream track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(new MediaStream(event.streams[0].getTracks()));
      } else {
        setRemoteStream(prev => {
          if (!prev) return new MediaStream([event.track]);
          const tracks = prev.getTracks().filter(t => t.id !== event.track.id);
          tracks.push(event.track);
          return new MediaStream(tracks);
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[StreamContext] Connection state with ${targetSocketId}:`, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetSocketId);
      }
    };

    peerConnectionsRef.current.set(targetSocketId, pc);
    return pc;
  }, [socket, currentUser]);

  // Host starts broadcasting a MediaStream (from screen share)
  const startBroadcast = useCallback(async (mediaStream, streamType = 'screen', title = '') => {
    if (!roomId || !mediaStream) return;

    localStreamRef.current = mediaStream;
    setIsBroadcasting(true);
    setStreamInfo({ streamType, title });

    // Inform server that broadcast has started
    socket.emit('stream:start_broadcast', { roomId, streamType, title });

    // Connect to all other participants currently in room
    participants.forEach(async (p) => {
      if (p.id !== currentUser?.id && p.socketId) {
        const pc = createStreamPeerConnection(p.socketId);
        try {
          const offer = await pc.createOffer();
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

    peerConnectionsRef.current.forEach(pc => {
      try { pc.close(); } catch (e) {}
    });
    peerConnectionsRef.current.clear();
    candidateQueueRef.current.clear();

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

    // A viewer asked for the stream (e.g. late joiner)
    const handleStreamRequested = async ({ requesterSocketId }) => {
      if (localStreamRef.current && requesterSocketId) {
        const pc = createStreamPeerConnection(requesterSocketId);
        try {
          const offer = await pc.createOffer();
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
    };

    // Broadcast stopped event
    const handleBroadcastStopped = () => {
      setRemoteStream(null);
      setStreamInfo(null);
      peerConnectionsRef.current.forEach(pc => {
        try { pc.close(); } catch (e) {}
      });
      peerConnectionsRef.current.clear();
      candidateQueueRef.current.clear();
    };

    // Signal received (Offer / Answer / ICE Candidate)
    const handleStreamSignal = async ({ callerSocketId, signal, fromUserId }) => {
      try {
        if (signal.type === 'offer') {
          let pc = peerConnectionsRef.current.get(callerSocketId);
          if (!pc || pc.signalingState === 'closed') {
            pc = createStreamPeerConnection(callerSocketId);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(signal));

          // Drain queued ICE candidates
          const queue = candidateQueueRef.current.get(callerSocketId) || [];
          for (const cand of queue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {}
          }
          candidateQueueRef.current.delete(callerSocketId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('stream:signal', {
            targetSocketId: callerSocketId,
            signal: answer,
            fromUserId: currentUser?.id
          });
        } else if (signal.type === 'answer') {
          const pc = peerConnectionsRef.current.get(callerSocketId);
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            // Drain queued ICE candidates
            const queue = candidateQueueRef.current.get(callerSocketId) || [];
            for (const cand of queue) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {}
            }
            candidateQueueRef.current.delete(callerSocketId);
          }
        } else if (signal.candidate || signal.type === 'candidate') {
          const candidateData = signal.candidate || signal;
          const pc = peerConnectionsRef.current.get(callerSocketId);
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch (err) {
              console.warn('[StreamContext] Failed to add ICE candidate:', err);
            }
          } else {
            // Buffer candidate until remote description is set
            const queue = candidateQueueRef.current.get(callerSocketId) || [];
            queue.push(candidateData);
            candidateQueueRef.current.set(callerSocketId, queue);
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
  }, [socket, currentUser, createStreamPeerConnection]);

  // Request stream automatically when a guest joins a room where a screen share is active
  useEffect(() => {
    if (currentVideo && (currentVideo.type === 'screen' || currentVideo.type === 'screen_share') && !isHost) {
      const timer = setTimeout(() => {
        if (!remoteStream) {
          requestStreamFromHost();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentVideo?.id, currentVideo?.type, isHost, requestStreamFromHost, remoteStream]);

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
