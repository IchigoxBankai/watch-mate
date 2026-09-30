import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { CONSTANTS } from './config/constants.js';
import { roomManager } from './services/roomManager.js';
import { registerRoomHandlers } from './socket/roomSocket.js';
import { registerSyncHandlers } from './socket/syncSocket.js';
import { registerChatHandlers } from './socket/chatSocket.js';
import { registerWebRTCHandlers } from './socket/webrtcSocket.js';
import { searchYouTube } from './services/youtubeService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// REST Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'Watch-Mate',
    tagline: 'Watch together. Stay together.',
    activeRooms: roomManager.rooms.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/youtube/search', async (req, res) => {
  const query = req.query.q || '';
  const limit = parseInt(req.query.limit) || 20;

  try {
    const results = await searchYouTube(query, limit);
    res.json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('YouTube search route error:', error);
    res.status(500).json({ success: false, error: 'Failed to search YouTube' });
  }
});

app.get('/api/videos/samples', (req, res) => {

  res.json({
    success: true,
    samples: CONSTANTS.DEFAULT_SAMPLE_VIDEOS
  });
});

app.get('/api/rooms/validate/:roomId', (req, res) => {
  const { roomId } = req.params;
  const cleanId = (roomId || '').trim().toLowerCase();
  const room = roomManager.getRoom(cleanId);

  res.json({
    exists: !!room,
    room: room ? {
      id: room.id,
      name: room.name,
      participantCount: room.participants.size,
      settings: room.settings
    } : null
  });
});

app.post('/api/rooms/create', (req, res) => {
  const { roomId, name, hostUser, settings } = req.body;
  if (!roomId || !hostUser) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanId = roomId.trim().toLowerCase();
  const room = roomManager.createRoom({
    roomId: cleanId,
    name: name || `Lounge-${cleanId.slice(-4).toUpperCase()}`,
    hostUser,
    settings
  });

  res.json({
    success: true,
    room: roomManager.getPublicRoomState(cleanId)
  });
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on('connection', (socket) => {
  // Register modular handlers
  registerRoomHandlers(io, socket);
  registerSyncHandlers(io, socket);
  registerChatHandlers(io, socket);
  registerWebRTCHandlers(io, socket);
});

server.listen(PORT, () => {
  console.log(`[Syncora Server] Running on http://localhost:${PORT}`);
});
