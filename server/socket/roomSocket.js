import { roomManager } from '../services/roomManager.js';

export function registerRoomHandlers(io, socket) {
  // Join Room
  socket.on('room:join', ({ roomId, user }) => {
    if (!roomId || !user || !user.id) {
      socket.emit('room:error', { message: 'Invalid join credentials' });
      return;
    }

    const cleanRoomId = roomId.trim().toLowerCase();
    socket.join(cleanRoomId);

    const { room, participant } = roomManager.joinRoom(cleanRoomId, user, socket.id);
    const fullState = roomManager.getPublicRoomState(cleanRoomId);

    // Send complete current room snapshot to the joining user
    socket.emit('room:initial_state', fullState);

    // Broadcast to everyone else in the room that a user joined
    socket.to(cleanRoomId).emit('room:participant_joined', {
      participant,
      totalParticipants: room.participants.size
    });

    // Also broadcast a system chat message
    const joinMsg = roomManager.addMessage(cleanRoomId, {
      senderId: 'system',
      senderName: 'System',
      text: `${participant.name} joined the room`,
      type: 'system'
    });
    if (joinMsg) {
      io.to(cleanRoomId).emit('chat:new_message', joinMsg);
    }
  });

  // Leave Room
  socket.on('room:leave', () => {
    handleLeave(io, socket);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    handleLeave(io, socket);
  });

  // Room Settings Update (Host only)
  socket.on('room:update_settings', ({ roomId, settings }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta || room.hostId !== userMeta.userId) {
      socket.emit('room:error', { message: 'Only the host can modify room settings' });
      return;
    }

    room.settings = { ...room.settings, ...settings };
    io.to(roomId).emit('room:settings_updated', room.settings);
  });

  // Kick Participant (Host only)
  socket.on('room:kick_participant', ({ roomId, targetUserId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta || room.hostId !== userMeta.userId) return;

    const targetUser = room.participants.get(targetUserId);
    if (targetUser && targetUser.socketId) {
      io.to(targetUser.socketId).emit('room:kicked', { message: 'You have been removed from the room by the host' });
      const targetSocket = io.sockets.sockets.get(targetUser.socketId);
      if (targetSocket) {
        targetSocket.leave(roomId);
        handleLeave(io, targetSocket);
      }
    }
  });

  // Transfer Host Privileges (Host only)
  socket.on('room:transfer_host', ({ roomId, targetUserId }) => {
    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    const result = roomManager.transferHost(roomId, userMeta.userId, targetUserId);
    if (!result) {
      socket.emit('room:error', { message: 'Failed to transfer host privileges' });
      return;
    }

    const { newHost, oldHost } = result;

    // Broadcast host transfer to everyone in the room
    io.to(roomId).emit('room:host_transferred', {
      newHostId: newHost.id,
      newHostName: newHost.name,
      oldHostName: oldHost ? oldHost.name : 'Previous Host'
    });

    // Broadcast system toast
    io.to(roomId).emit('room:toast', {
      message: `${newHost.name} is now the Room Host 👑`,
      type: 'success'
    });

    // Chat announcement
    const msg = roomManager.addMessage(roomId, {
      senderId: 'system',
      senderName: 'System',
      text: `👑 Host privileges transferred to ${newHost.name}`,
      type: 'system'
    });
    if (msg) {
      io.to(roomId).emit('chat:new_message', msg);
    }
  });
}

function handleLeave(io, socket) {
  const result = roomManager.leaveRoom(socket.id);
  if (!result || !result.room) return;

  const { room, leftUser, newHostId } = result;
  if (!leftUser) return;

  socket.leave(room.id);

  // Notify remaining participants
  io.to(room.id).emit('room:participant_left', {
    userId: leftUser.id,
    name: leftUser.name,
    newHostId,
    totalParticipants: room.participants.size
  });

  // WebRTC notify to tear down peer connections
  io.to(room.id).emit('webrtc:peer_left', { peerId: socket.id, userId: leftUser.id });

  // System notification
  const leaveMsg = roomManager.addMessage(room.id, {
    senderId: 'system',
    senderName: 'System',
    text: `${leftUser.name} left the room`,
    type: 'system'
  });
  if (leaveMsg) {
    io.to(room.id).emit('chat:new_message', leaveMsg);
  }
}
