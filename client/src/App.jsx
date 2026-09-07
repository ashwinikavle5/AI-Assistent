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
import { NativeLanguage } from './pages/NativeLanguage';
import { Pronunciation } from './pages/Pronunciation';
import { Practice } from './pages/Practice';
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
                  <Route path="/native-language" element={<NativeLanguage />} />
                  <Route path="/pronunciation" element={<Pronunciation />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="/settings" element={<Settings />} />

                  {/* Graceful redirects for clean navigation */}
                  <Route path="/ai-assistant" element={<Navigate to="/practice" replace />} />
                  <Route path="/streak" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/profile" element={<Navigate to="/settings" replace />} />
                  <Route path="/progress" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/grammar" element={<Navigate to="/practice?tab=grammar" replace />} />
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
