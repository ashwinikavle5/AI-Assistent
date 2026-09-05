import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import robotAvatar from '../../assets/speakwise-robot.png';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <img src={robotAvatar} alt="SpeakWise AI Assistant" className="absolute w-8 h-8 object-contain animate-bounce" />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Loading SpeakWise AI...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
