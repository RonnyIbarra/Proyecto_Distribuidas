import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginAdmin from './pages/LoginAdmin';
import AdminPanel from './pages/AdminPanel';
import JoinRoom from './pages/JoinRoom';
import ChatRoom from './pages/ChatRoom';
import ShareRoom from './pages/ShareRoom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/join" replace />} />
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/share/:roomId" element={<ShareRoom />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
          </Routes>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
