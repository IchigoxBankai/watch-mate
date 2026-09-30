import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin
);

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[Socket] Connected to Syncora server:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.warn('[Socket] Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('[Socket] Connection error:', error.message);
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
export const socket = socketService.connect();
