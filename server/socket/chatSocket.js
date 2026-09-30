import { roomManager } from '../services/roomManager.js';

export function registerChatHandlers(io, socket) {
  // Send chat message
  socket.on('chat:send_message', ({ roomId, message }) => {
    if (!roomId || !message || !message.text) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    if (!userMeta) return;

    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(userMeta.userId);
    const senderName = participant ? participant.name : (message.senderName || 'Anonymous');
    const senderAvatar = participant ? participant.avatar : (message.senderAvatar || '');

    const savedMessage = roomManager.addMessage(roomId, {
      senderId: userMeta.userId,
      senderName,
      senderAvatar,
      text: message.text,
      type: 'user'
    });

    if (savedMessage) {
      io.to(roomId).emit('chat:new_message', savedMessage);
    }
  });

  // Floating Emoji Reaction
  socket.on('reaction:send', ({ roomId, reaction }) => {
    if (!roomId || !reaction) return;

    const userMeta = roomManager.userSocketMap.get(socket.id);
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const participant = userMeta ? room.participants.get(userMeta.userId) : null;
    const senderName = participant ? participant.name : 'Anonymous';

    const reactionPayload = {
      id: `rxn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      emoji: reaction.emoji || '❤️',
      senderId: userMeta ? userMeta.userId : 'anon',
      senderName,
      // Random X position between 10% and 90%
      xPos: reaction.xPos || Math.floor(Math.random() * 70) + 15,
      timestamp: Date.now()
    };

    // Broadcast reaction to everyone in the room
    io.to(roomId).emit('reaction:received', reactionPayload);
  });
}
