import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from '../ui/ThemeSelector';
import robotAvatar from '../../assets/speakwise-robot.png';
import {
  LayoutDashboard,
  Bot,
  Volume2,
  BrainCircuit,
  Flame,
  BarChart3,
  User,
  Settings,
  LogOut,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { path: '/pronunciation', label: 'Pronunciation', icon: Volume2 },
  { path: '/practice', label: 'Practice', icon: BrainCircuit },
  { path: '/streak', label: 'Streak', icon: Flame },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--border-main)'
        }}
      >
        {/* Logo and Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border-main)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 16px var(--accent-glow)'
              }}
            >
              <img
                src={robotAvatar}
                alt="SpeakWise AI Assistant"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                <span>SpeakWise</span>
                <span style={{ color: 'var(--accent-primary)' }}>AI</span>
              </h1>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Your friendly AI English companion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl border hover:opacity-80 transition cursor-pointer"
            style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                    isActive ? 'shadow-md' : 'hover:opacity-90'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 6px 16px var(--accent-glow)' : 'none'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className="transition-transform group-hover:scale-110"
                      style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-main)' }}>
          {/* Theme Selector Button */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Appearance
            </span>
            <ThemeSelector />
          </div>

          {/* User Profile Mini Badge */}
          <div
            className="flex items-center justify-between p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                  {user?.name || 'Learner'}
                </p>
                <p className="text-[10px] truncate capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user?.english_level || 'Intermediate'} Level
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
