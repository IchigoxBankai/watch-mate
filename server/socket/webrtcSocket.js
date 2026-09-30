import { roomManager } from '../services/roomManager.js';

export function registerWebRTCHandlers(io, socket) {
  // Join voice channel
  socket.on('webrtc:join_voice', ({ roomId, userId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    roomManager.updateParticipantAudio(roomId, userId, { isAudioEnabled: true });

    // Collect list of other peers currently in the voice channel
    const otherVoicePeers = Array.from(room.participants.values())
      .filter(p => p.socketId !== socket.id && p.isAudioEnabled)
      .map(p => ({
        socketId: p.socketId,
        userId: p.id,
        name: p.name,
        avatar: p.avatar
      }));

    // Send the list of existing peers to the newly joined peer
    socket.emit('webrtc:all_peers', otherVoicePeers);

    // Notify others that a new peer joined voice
    socket.to(roomId).emit('webrtc:user_joined_voice', {
      socketId: socket.id,
      userId,
      name: room.participants.get(userId)?.name || 'Someone'
    });
  });

  // Leave voice channel
  socket.on('webrtc:leave_voice', ({ roomId, userId }) => {
    roomManager.updateParticipantAudio(roomId, userId, {
      isAudioEnabled: false,
      isSpeaking: false,
      isMuted: true
    });

    socket.to(roomId).emit('webrtc:user_left_voice', {
      socketId: socket.id,
      userId
    });
  });

  // Relay WebRTC Signal (Offer / Answer / ICE Candidate) to specific target peer
  socket.on('webrtc:signal', ({ targetSocketId, signal, fromUserId }) => {
    if (!targetSocketId) return;

    io.to(targetSocketId).emit('webrtc:signal', {
      callerSocketId: socket.id,
      signal,
      fromUserId
    });
  });

  // Voice Speaking Status (Web Audio API VAD detected)
  socket.on('voice:speaking_status', ({ roomId, isSpeaking }) => {
    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    roomManager.updateParticipantAudio(roomId, userMeta.userId, { isSpeaking });

    socket.to(roomId).emit('voice:participant_speaking', {
      userId: userMeta.userId,
      isSpeaking
    });
  });

  // Mute / Unmute status toggle
  socket.on('voice:mute_status', ({ roomId, isMuted }) => {
    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    roomManager.updateParticipantAudio(roomId, userMeta.userId, { isMuted });

    io.to(roomId).emit('voice:participant_mute_changed', {
      userId: userMeta.userId,
      isMuted
    });
  });

  // WebRTC Stream Broadcasting (Local Video & Screen Sharing direct to viewers)
  socket.on('stream:signal', ({ targetSocketId, signal, fromUserId }) => {
    if (!targetSocketId) return;

    io.to(targetSocketId).emit('stream:signal', {
      callerSocketId: socket.id,
      signal,
      fromUserId
    });
  });

  socket.on('stream:start_broadcast', ({ roomId, streamType, title }) => {
    socket.to(roomId).emit('stream:broadcast_started', {
      broadcasterSocketId: socket.id,
      streamType,
      title
    });
  });

  socket.on('stream:stop_broadcast', ({ roomId }) => {
    socket.to(roomId).emit('stream:broadcast_stopped');
  });

  socket.on('stream:request_stream', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;
    const host = room.participants.get(room.hostId);
    if (host && host.socketId && host.socketId !== socket.id) {
      io.to(host.socketId).emit('stream:stream_requested', {
        requesterSocketId: socket.id
      });
    }
  });
}
