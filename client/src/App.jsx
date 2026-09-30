import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import { VoiceProvider } from './context/VoiceContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserHome from './pages/UserHome';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import WatchRoomPage from './pages/WatchRoomPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <VoiceProvider>
            <ChatProvider>
              <div className="min-h-screen bg-syncora-bg text-syncora-text flex flex-col font-sans">
                <Toast />
                <Navbar />
                <div className="flex-1 flex flex-col">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/home" element={<UserHome />} />
                    <Route path="/create" element={<CreateRoomPage />} />
                    <Route path="/join" element={<JoinRoomPage />} />
                    <Route path="/room/:roomId" element={<WatchRoomPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </div>
            </ChatProvider>
          </VoiceProvider>
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
