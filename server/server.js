import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { CONSTANTS } from './config/constants.js';
import { roomManager } from './services/roomManager.js';
import { registerRoomHandlers } from './socket/roomSocket.js';
import { registerSyncHandlers } from './socket/syncSocket.js';
import { registerChatHandlers } from './socket/chatSocket.js';
import { registerWebRTCHandlers } from './socket/webrtcSocket.js';
import { searchYouTube } from './services/youtubeService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const cleanExt = path.extname(file.originalname).toLowerCase() || '.mp4';
    const baseName = path.basename(file.originalname, cleanExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${baseName}-${uniqueSuffix}${cleanExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (.mp4, .webm, .mov, .mkv, etc.) are allowed'));
    }
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Serve static uploaded videos with Accept-Ranges byte seeking
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Video Upload Route
app.post('/api/upload/video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const videoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: videoUrl,
      fileName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Video upload failed' });
  }
});

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
