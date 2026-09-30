import { CONSTANTS } from '../config/constants.js';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room object
    this.userSocketMap = new Map(); // socketId -> { userId, roomId }
  }

  createRoom({ roomId, name, hostUser, settings = {} }) {
    const defaultSettings = {
      isPrivate: true,
      allowAnyoneWithLink: true,
      requireApproval: false,
      hostOnlyControl: false,
      allowReactions: true,
      voiceChatEnabled: true,
      ...settings
    };

    const room = {
      id: roomId,
      name: name || `Lounge-${roomId.slice(-4).toUpperCase()}`,
      createdAt: Date.now(),
      hostId: hostUser.id,
      settings: defaultSettings,
      participants: new Map(), // userId -> Participant
      currentVideo: null,
      playback: {
        isPlaying: false,
        currentTime: 0,
        lastUpdatedAt: Date.now(),
        playbackRate: 1.0,
        updatedBy: hostUser.name
      },
      messages: [],
      pendingApprovals: new Set()
    };

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  hasRoom(roomId) {
    return this.rooms.has(roomId);
  }

  joinRoom(roomId, user, socketId) {
    let room = this.rooms.get(roomId);
    if (!room) {
      // Auto-create if user is joining a fresh generated ID
      room = this.createRoom({ roomId, name: `Room ${roomId.toUpperCase()}`, hostUser: user });
    }

    // If participant was already in room with an older socket, clean up old socket mapping
    const existing = room.participants.get(user.id);
    if (existing && existing.socketId && existing.socketId !== socketId) {
      this.userSocketMap.delete(existing.socketId);
    }

    const participant = {
      id: user.id,
      name: user.name || (existing ? existing.name : 'Anonymous Watcher'),
      avatar: user.avatar || (existing ? existing.avatar : ''),
      socketId,
      joinedAt: existing ? existing.joinedAt : Date.now(),
      isHost: room.hostId === user.id,
      isMuted: existing ? existing.isMuted : true,
      isSpeaking: false,
      isAudioEnabled: existing ? existing.isAudioEnabled : false
    };

    // If room had no host (or host had left and no one was host), assign first participant
    if (!room.hostId || room.participants.size === 0) {
      room.hostId = user.id;
      participant.isHost = true;
    }

    room.participants.set(user.id, participant);
    this.userSocketMap.set(socketId, { userId: user.id, roomId });

    return { room, participant };
  }

  leaveRoom(socketId) {
    const userMeta = this.userSocketMap.get(socketId);
    if (!userMeta) return null;

    const { userId, roomId } = userMeta;
    const room = this.rooms.get(roomId);
    this.userSocketMap.delete(socketId);

    if (!room) return null;

    const leftUser = room.participants.get(userId);
    room.participants.delete(userId);

    // If leaving user was host and others remain, transfer host to next oldest participant
    if (room.hostId === userId && room.participants.size > 0) {
      const nextHost = Array.from(room.participants.values())[0];
      room.hostId = nextHost.id;
      nextHost.isHost = true;
    }

    // Clean up empty rooms after 1 hour of inactivity if desired, or keep alive
    return { room, leftUser, newHostId: room.hostId };
  }

  transferHost(roomId, currentUserId, targetUserId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.hostId !== currentUserId) return null;

    const targetUser = room.participants.get(targetUserId);
    if (!targetUser) return null;

    const oldHost = room.participants.get(currentUserId);
    if (oldHost) oldHost.isHost = false;

    room.hostId = targetUserId;
    targetUser.isHost = true;

    return { room, oldHost, newHost: targetUser };
  }

  updatePlayback(roomId, { isPlaying, currentTime, playbackRate, updatedBy }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.playback = {
      isPlaying: isPlaying !== undefined ? isPlaying : room.playback.isPlaying,
      currentTime: currentTime !== undefined ? currentTime : room.playback.currentTime,
      playbackRate: playbackRate !== undefined ? playbackRate : room.playback.playbackRate,
      lastUpdatedAt: Date.now(),
      updatedBy: updatedBy || 'Participant'
    };

    return room.playback;
  }

  changeVideo(roomId, videoData, updatedBy) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.currentVideo = {
      id: videoData.id || `video-${Date.now()}`,
      title: videoData.title || 'Custom Video',
      url: videoData.url,
      type: videoData.type || 'direct',
      duration: videoData.duration || 0,
      thumbnail: videoData.thumbnail || ''
    };

    // Reset playback position
    room.playback = {
      isPlaying: true,
      currentTime: 0,
      lastUpdatedAt: Date.now(),
      playbackRate: 1.0,
      updatedBy: updatedBy || 'Host'
    };

    return room;
  }

  addMessage(roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const formattedMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar,
      text: (message.text || '').trim().slice(0, 500),
      timestamp: Date.now(),
      type: message.type || 'text'
    };

    room.messages.push(formattedMessage);
    if (room.messages.length > CONSTANTS.MAX_CHAT_HISTORY) {
      room.messages.shift();
    }

    return formattedMessage;
  }

  updateParticipantAudio(roomId, userId, { isMuted, isSpeaking, isAudioEnabled }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const participant = room.participants.get(userId);
    if (!participant) return null;

    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (isSpeaking !== undefined) participant.isSpeaking = isSpeaking;
    if (isAudioEnabled !== undefined) participant.isAudioEnabled = isAudioEnabled;

    return participant;
  }

  getPublicRoomState(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      settings: room.settings,
      participants: Array.from(room.participants.values()),
      currentVideo: room.currentVideo,
      playback: room.playback,
      messages: room.messages
    };
  }
}

export const roomManager = new RoomManager();
