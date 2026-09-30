# Syncora (Watch-Mate)

> **"Watch together. Stay together."**

Syncora is a modern, cinematic watch-together digital lounge where friends, couples, and groups can create private rooms and watch supported video content together in real-time while communicating through low-latency live WebRTC voice chat.

---

## 🌟 Visual Identity & Design Direction

- **Theme**: "Midnight cinematic social space"
- **Palette**: Deep charcoal background (`#0B0B0F`), sleek elevated surfaces (`#181820`), electric coral accents (`#FF6B5E`), soft violet highlights (`#A78BFA`), warm off-white typography (`#F7F5F2`), muted borders (`rgba(255,255,255,0.08)`).
- **Typography**: Geometric modern sans-serifs (Outfit + Plus Jakarta Sans).
- **Branding**: Dual-orbit synchronized connection playmark.

---

## ⚡ Core Features

- 🎬 **Sub-second Video Synchronization**: Play, pause, seek, and drift recovery with ~300ms anti-loop tolerance.
- 🎙️ **Live WebRTC Voice Chat**: Peer-to-peer mesh audio with real-time Voice Activity Detection (VAD) and glowing avatar speech rings.
- 🍿 **Multi-Source Video Engine**: Curated 4K/HD sample movies, direct MP4/WebM video stream links, YouTube embeds, and local file playback.
- 🔒 **Private & Controlled Lounges**: Host permissions, kick participant privileges, host-only playback restrictions.
- 💬 **Room Text Chat & System Log**: Real-time room conversation alongside the video stage.
- ❤️ **Floating Live Emoji Bursts**: Animated interactive reaction particles that float up over the screen without blocking the movie.
- 📱 **Mobile & PWA Ready**: Intentional mobile bottom sheets, responsive controls, and PWA manifest.
- 🔑 **Dual Authentication**: Firebase Auth (Email/Password & Google Sign-In) + Zero-config Local Guest Mode.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **React 18** with **Vite**
- **Tailwind CSS** (Custom cinematic design system tokens)
- **Framer Motion** (Micro-interactions, page transitions, floating reactions)
- **Lucide React** (Minimalist UI icons)
- **Web Audio API** (`AudioContext` + `AnalyserNode` for live voice frequency detection)
- **Socket.IO Client**

### **Backend**
- **Node.js** & **Express.js**
- **Socket.IO** (Room lifecycle, sync events, WebRTC signaling mesh, chat, reactions)
- **Modular Socket Handlers**: `roomSocket.js`, `syncSocket.js`, `chatSocket.js`, `webrtcSocket.js`

### **Authentication & Persistence**
- **Firebase Authentication & Firestore** (Configured via `.env` or automatic fallback to local persistence)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Installation
Clone the repository and install all root, client, and server dependencies in one command:

```bash
npm run install:all
```

### 3. Environment Configuration
Copy `.env.example` to create your environment variables:

```bash
cp .env.example .env
```

*(Note: The app works 100% out of the box with zero external configuration using the built-in local fallback mode!)*

### 4. Running Locally

Run both frontend and backend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API & Socket Server**: `http://localhost:5000`

Or run them in separate terminals:
```bash
# Terminal 1 (Backend)
npm run server

# Terminal 2 (Frontend)
npm run client
```

---

## 📡 WebRTC Voice Signaling & Audio Architecture

Syncora uses a full-mesh WebRTC topology orchestrated via Socket.IO signaling:
1. When a user taps **"Join Voice"**, their browser requests microphone permissions and initializes a Web Audio API `AudioContext` with an `AnalyserNode`.
2. The client emits `webrtc:join_voice`.
3. Existing participants in the voice room generate WebRTC offers, exchange ICE candidates via Google STUN servers (`stun:stun.l.google.com:19302`), and establish direct audio channels.
4. Voice activity is detected locally in real time (frequency thresholding) and transmitted to render glowing voice rings around speaking avatars.
5. If microphone permission is denied, the watch room continues uninterrupted without breaking.

---

## 🔄 Video Synchronization Engine

The sync engine uses an anti-loop tolerance state machine:
- When a host/watcher plays, pauses, or seeks, a lightweight payload is broadcasted across the room with timestamp metadata.
- If a client's local playback position drifts from the authoritative room position by more than **300ms**, the player smoothly seeks to catch up.
- Prevents infinite broadcast loops through synchronous event flags (`isSyncingRef`).

---

## 🚢 Deployment Guide

### Deploying Frontend (Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SERVER_URL`: `https://your-syncora-backend.onrender.com`
  - (Optional) `VITE_FIREBASE_*` variables

### Deploying Backend (Render / Railway / Fly.io)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment Variables**:
  - `PORT`: `5000`
  - `CLIENT_URL`: `https://your-syncora-frontend.vercel.app`

---

## 📄 License
MIT License. Crafted with precision for shared cinematic experiences.
