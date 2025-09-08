import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Cafeteria from './pages/Cafeteria';
import Events from './pages/Events';
import LostFound from './pages/LostFound';
import AcademicQuery from './pages/AcademicQuery';
import UserManagement from './pages/UserManagement';

function AppContent({ user, onLogout }) {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} showServices={!isDashboard} />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/timetable" element={<Timetable user={user} />} />
          <Route path="/cafeteria" element={<Cafeteria user={user} />} />
          <Route path="/events" element={<Events user={user} />} />
          <Route path="/lost-found" element={<LostFound user={user} />} />
          <Route path="/academic-query" element={<AcademicQuery user={user} />} />
          <Route path="/user-management" element={<UserManagement user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('authToken') !== null;
  });
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <AppContent user={user} onLogout={handleLogout} />;
}

export default App;