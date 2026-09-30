import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import { useRoom } from './RoomContext';

const VoiceContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function VoiceProvider({ children }) {
  const { currentUser } = useAuth();
  const { roomId } = useRoom();

  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set()); // Set of userIds who are speaking
  const [mutedUsers, setMutedUsers] = useState(new Map()); // userId -> boolean
  const [voiceError, setVoiceError] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const remoteAudiosRef = useRef(new Map()); // socketId -> HTMLAudioElement

  const socket = socketService.getSocket();

  // Voice Activity Detection (VAD) via Web Audio API
  const setupVoiceActivityDetection = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingCounter = 0;

      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || isMuted) {
          if (isSpeakingLocally) {
            setIsSpeakingLocally(false);
            if (roomId && currentUser) {
              socket.emit('voice:speaking_status', { roomId, isSpeaking: false });
            }
          }
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for human voice
        const isSpeakingNow = average > 18;

        if (isSpeakingNow) {
          speakingCounter = Math.min(speakingCounter + 1, 5);
        } else {
          speakingCounter = Math.max(speakingCounter - 1, 0);
        }

        const currentlySpeaking = speakingCounter >= 2;

        if (currentlySpeaking !== isSpeakingLocally) {
          setIsSpeakingLocally(currentlySpeaking);
          if (roomId && currentUser) {
            socket.emit('voice:speaking_status', { roomId, isSpeaking: currentlySpeaking });
          }
        }
      }, 150);
    } catch (err) {
      console.warn('[VAD] Could not initialize Web Audio Analyser:', err);
    }
  };

  // Create Peer Connection for a remote peer
  const createPeerConnection = useCallback((targetSocketId, targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local audio tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:signal', {
          targetSocketId,
          signal: { type: 'candidate', candidate: event.candidate },
          fromUserId: currentUser?.id
        });
      }
    };

    // Remote audio stream received
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        let audioEl = remoteAudiosRef.current.get(targetSocketId);
        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          audioEl.volume = isDeafened ? 0 : 1.0;
          remoteAudiosRef.current.set(targetSocketId, audioEl);
        }
        audioEl.srcObject = remoteStream;
        audioEl.play().catch(e => console.warn('[WebRTC] Auto-play audio prevented:', e));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        peerConnectionsRef.current.delete(targetSocketId);
      }
    };

    peerConnectionsRef.current.set(targetSocketId, pc);
    return pc;
  }, [socket, currentUser, isDeafened]);

  // Join Voice Channel
  const joinVoice = async () => {
    if (!roomId || !currentUser) return;
    setVoiceError(null);

    try {
      // Request audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      localStreamRef.current = stream;
      setIsVoiceConnected(true);
      setIsMuted(false);

      // Start VAD
      setupVoiceActivityDetection(stream);

      // Signal to room that we entered voice
      socket.emit('webrtc:join_voice', { roomId, userId: currentUser.id });
    } catch (err) {
      console.warn('[WebRTC] Microphone access denied or unavailable:', err);
      setVoiceError('Microphone access is needed for voice chat.');
      setIsVoiceConnected(false);
    }
  };

  // Leave Voice Channel
  const leaveVoice = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Clean up audio elements
    remoteAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.srcObject = null;
    });
    remoteAudiosRef.current.clear();

    setIsVoiceConnected(false);
    setIsSpeakingLocally(false);

    if (roomId && currentUser && socket) {
      socket.emit('webrtc:leave_voice', { roomId, userId: currentUser.id });
      socket.emit('voice:speaking_status', { roomId, isSpeaking: false });
    }
  }, [roomId, currentUser, socket]);

  // Toggle Mute
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const newMute = !isMuted;
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !newMute;
    });
    setIsMuted(newMute);
    if (roomId) {
      socket.emit('voice:mute_status', { roomId, isMuted: newMute });
    }
  };

  // Toggle Deafen (Speaker Mute)
  const toggleDeafen = () => {
    const newDeafen = !isDeafened;
    setIsDeafened(newDeafen);
    remoteAudiosRef.current.forEach(audio => {
      audio.volume = newDeafen ? 0 : 1.0;
    });
  };

  // Socket signaling listener for WebRTC
  useEffect(() => {
    if (!socket) return;

    // Server sends list of existing voice peers
    const handleAllPeers = async (peers) => {
      for (const peer of peers) {
        const pc = createPeerConnection(peer.socketId, peer.userId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc:signal', {
            targetSocketId: peer.socketId,
            signal: offer,
            fromUserId: currentUser?.id
          });
        } catch (err) {
          console.warn('[WebRTC] Error creating offer for peer:', err);
        }
      }
    };

    // Another user joined voice
    const handleUserJoinedVoice = ({ socketId, userId }) => {
      // Peer will send offer to us
      createPeerConnection(socketId, userId);
    };

    // User left voice
    const handleUserLeftVoice = ({ socketId, userId }) => {
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(socketId);
      }
      const audioEl = remoteAudiosRef.current.get(socketId);
      if (audioEl) {
        audioEl.pause();
        audioEl.srcObject = null;
        remoteAudiosRef.current.delete(socketId);
      }
      setSpeakingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    // Signal received (Offer / Answer / ICE candidate)
    const handleSignal = async ({ callerSocketId, signal, fromUserId }) => {
      let pc = peerConnectionsRef.current.get(callerSocketId);
      if (!pc) {
        pc = createPeerConnection(callerSocketId, fromUserId);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc:signal', {
            targetSocketId: callerSocketId,
            signal: answer,
            fromUserId: currentUser?.id
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('[WebRTC] Signaling error handling signal:', err);
      }
    };

    // Speaking indicator event
    const handleParticipantSpeaking = ({ userId, isSpeaking }) => {
      setSpeakingUsers(prev => {
        const next = new Set(prev);
        if (isSpeaking) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    };

    // Mute status changed
    const handleParticipantMuteChanged = ({ userId, isMuted: peerMuted }) => {
      setMutedUsers(prev => new Map(prev).set(userId, peerMuted));
    };

    socket.on('webrtc:all_peers', handleAllPeers);
    socket.on('webrtc:user_joined_voice', handleUserJoinedVoice);
    socket.on('webrtc:user_left_voice', handleUserLeftVoice);
    socket.on('webrtc:signal', handleSignal);
    socket.on('voice:participant_speaking', handleParticipantSpeaking);
    socket.on('voice:participant_mute_changed', handleParticipantMuteChanged);

    return () => {
      socket.off('webrtc:all_peers', handleAllPeers);
      socket.off('webrtc:user_joined_voice', handleUserJoinedVoice);
      socket.off('webrtc:user_left_voice', handleUserLeftVoice);
      socket.off('webrtc:signal', handleSignal);
      socket.off('voice:participant_speaking', handleParticipantSpeaking);
      socket.off('voice:participant_mute_changed', handleParticipantMuteChanged);
    };
  }, [socket, currentUser, createPeerConnection]);

  // Clean up voice when leaving room or unmounting
  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  const value = {
    isVoiceConnected,
    isMuted,
    isDeafened,
    isSpeakingLocally,
    speakingUsers,
    mutedUsers,
    voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
