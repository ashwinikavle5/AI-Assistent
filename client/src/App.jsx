import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AIAssistant } from './pages/AIAssistant';
import { Pronunciation } from './pages/Pronunciation';
import { Practice } from './pages/Practice';
import { Streak } from './pages/Streak';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// Root gatekeeper: redirects based on authentication state
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Protected Routes Guarded by ProtectedRoute */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai-assistant" element={<AIAssistant />} />
                  <Route path="/pronunciation" element={<Pronunciation />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/streak" element={<Streak />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              {/* Catch-all redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
