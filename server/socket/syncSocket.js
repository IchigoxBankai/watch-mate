import { roomManager } from '../services/roomManager.js';

export function registerSyncHandlers(io, socket) {
  // Client triggers play
  socket.on('sync:play', ({ roomId, currentTime }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    // Check host-only permission if enabled
    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host has playback control' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Someone';

    const playback = roomManager.updatePlayback(roomId, {
      isPlaying: true,
      currentTime: currentTime || room.playback.currentTime,
      updatedBy
    });

    // Broadcast play event to all room members (including sender for ack confirmation or to others)
    socket.to(roomId).emit('sync:play', {
      currentTime: playback.currentTime,
      updatedBy,
      timestamp: Date.now()
    });

    // System banner event
    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} started playback`,
      type: 'info'
    });
  });

  // Client triggers pause
  socket.on('sync:pause', ({ roomId, currentTime }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host has playback control' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Someone';

    const playback = roomManager.updatePlayback(roomId, {
      isPlaying: false,
      currentTime: currentTime !== undefined ? currentTime : room.playback.currentTime,
      updatedBy
    });

    socket.to(roomId).emit('sync:pause', {
      currentTime: playback.currentTime,
      updatedBy,
      timestamp: Date.now()
    });

    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} paused the room`,
      type: 'info'
    });
  });

  // Client seeks
  socket.on('sync:seek', ({ roomId, currentTime }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host has playback control' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Someone';

    const playback = roomManager.updatePlayback(roomId, {
      currentTime,
      updatedBy
    });

    socket.to(roomId).emit('sync:seek', {
      currentTime: playback.currentTime,
      isPlaying: playback.isPlaying,
      updatedBy,
      timestamp: Date.now()
    });

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} jumped to ${formatTime(currentTime)}`,
      type: 'info'
    });
  });

  // Request sync state (e.g. late join or drift recovery)
  socket.on('sync:request_state', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    // Calculate elapsed time if playing
    let accurateTime = room.playback.currentTime;
    if (room.playback.isPlaying) {
      const elapsed = (Date.now() - room.playback.lastUpdatedAt) / 1000;
      accurateTime += elapsed;
    }

    socket.emit('sync:current_state', {
      video: room.currentVideo,
      playback: {
        ...room.playback,
        currentTime: accurateTime
      }
    });
  });

  // Change Video Source
  socket.on('sync:change_video', ({ roomId, videoData }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host can change video' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Host';

    const updatedRoom = roomManager.changeVideo(roomId, videoData, updatedBy);

    io.to(roomId).emit('sync:video_changed', {
      video: updatedRoom.currentVideo,
      playback: updatedRoom.playback,
      updatedBy
    });

    const changeMsg = roomManager.addMessage(roomId, {
      senderId: 'system',
      senderName: 'System',
      text: `${updatedBy} changed video to "${videoData.title || 'New Video'}"`,
      type: 'system'
    });
    if (changeMsg) {
      io.to(roomId).emit('chat:new_message', changeMsg);
    }
  });

  // Playback rate sync
  socket.on('sync:rate', ({ roomId, rate }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) return;

    roomManager.updatePlayback(roomId, { playbackRate: rate });
    socket.to(roomId).emit('sync:rate', { rate });
  });

  // Countdown sync (e.g. for Netflix or external synchronized start)
  socket.on('sync:countdown', ({ roomId, count = 3, message = 'Starting in' }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    const participant = userMeta ? room.participants.get(userMeta.userId) : null;
    const initiator = participant ? participant.name : 'Host';

    io.to(roomId).emit('sync:countdown', {
      count,
      message,
      initiator,
      timestamp: Date.now()
    });
  });
}

