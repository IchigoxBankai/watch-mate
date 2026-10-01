import { roomManager } from '../services/roomManager.js';

export function registerSyncHandlers(io, socket) {
  // Handler for Play
  const handlePlay = ({ roomId, currentTime }) => {
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
    const updatedBy = participant ? participant.name : 'Host';

    const playback = roomManager.updatePlayback(roomId, {
      isPlaying: true,
      currentTime: currentTime !== undefined ? currentTime : room.playback.currentTime,
      updatedBy
    });

    const payload = {
      currentTime: playback.currentTime,
      isPlaying: true,
      updatedBy,
      timestamp: Date.now()
    };

    socket.to(roomId).emit('sync:play', payload);
    socket.to(roomId).emit('media:play', payload);

    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} started playback`,
      type: 'info'
    });
  };

  // Handler for Pause
  const handlePause = ({ roomId, currentTime }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host has playback control' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Host';

    const playback = roomManager.updatePlayback(roomId, {
      isPlaying: false,
      currentTime: currentTime !== undefined ? currentTime : room.playback.currentTime,
      updatedBy
    });

    const payload = {
      currentTime: playback.currentTime,
      isPlaying: false,
      updatedBy,
      timestamp: Date.now()
    };

    socket.to(roomId).emit('sync:pause', payload);
    socket.to(roomId).emit('media:pause', payload);

    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} paused the room`,
      type: 'info'
    });
  };

  // Handler for Seek
  const handleSeek = ({ roomId, currentTime }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host has playback control' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Host';

    const playback = roomManager.updatePlayback(roomId, {
      currentTime,
      updatedBy
    });

    const payload = {
      currentTime: playback.currentTime,
      isPlaying: playback.isPlaying,
      updatedBy,
      timestamp: Date.now()
    };

    socket.to(roomId).emit('sync:seek', payload);
    socket.to(roomId).emit('media:seek', payload);

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    io.to(roomId).emit('room:toast', {
      message: `${updatedBy} jumped to ${formatTime(currentTime)}`,
      type: 'info'
    });
  };

  // Handler for Request State (Late Join or Drift recovery)
  const handleRequestState = ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    let accurateTime = room.playback.currentTime;
    if (room.playback.isPlaying && room.playback.lastUpdatedAt) {
      const elapsed = (Date.now() - room.playback.lastUpdatedAt) / 1000;
      accurateTime += elapsed;
    }

    const statePayload = {
      video: room.currentVideo,
      media: room.currentVideo,
      playback: {
        ...room.playback,
        currentTime: accurateTime
      }
    };

    socket.emit('sync:current_state', statePayload);
    socket.emit('media:current_state', statePayload);
  };

  // Handler for Change Video
  const handleChangeVideo = ({ roomId, videoData }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.hostId !== userMeta.userId) {
      socket.emit('room:notification', { type: 'warning', message: 'Only the host can choose or change the video' });
      return;
    }

    const participant = room.participants.get(userMeta.userId);
    const updatedBy = participant ? participant.name : 'Host';

    const updatedRoom = roomManager.changeVideo(roomId, videoData, updatedBy);

    const changePayload = {
      video: updatedRoom.currentVideo,
      media: updatedRoom.currentVideo,
      playback: updatedRoom.playback,
      updatedBy
    };

    io.to(roomId).emit('sync:video_changed', changePayload);
    io.to(roomId).emit('media:source_changed', changePayload);

    const changeMsg = roomManager.addMessage(roomId, {
      senderId: 'system',
      senderName: 'System',
      text: `${updatedBy} changed video to "${videoData.title || 'New Video'}"`,
      type: 'system'
    });
    if (changeMsg) {
      io.to(roomId).emit('chat:new_message', changeMsg);
    }
  };

  // Register listeners with multiple alias support
  socket.on('sync:play', handlePlay);
  socket.on('media:play', handlePlay);

  socket.on('sync:pause', handlePause);
  socket.on('media:pause', handlePause);

  socket.on('sync:seek', handleSeek);
  socket.on('media:seek', handleSeek);

  socket.on('sync:request_state', handleRequestState);
  socket.on('media:request_state', handleRequestState);
  socket.on('media:sync', handleRequestState);

  socket.on('sync:change_video', handleChangeVideo);
  socket.on('media:source', handleChangeVideo);
  socket.on('media:change_video', handleChangeVideo);

  // Playback rate sync
  socket.on('sync:rate', ({ roomId, rate }) => {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    if (room.settings.hostOnlyControl && room.hostId !== userMeta.userId) return;

    roomManager.updatePlayback(roomId, { playbackRate: rate });
    socket.to(roomId).emit('sync:rate', { rate });
    socket.to(roomId).emit('media:rate', { rate });
  });

  // Countdown sync
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


