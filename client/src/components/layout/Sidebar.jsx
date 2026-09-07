import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import robotAvatar from '../../assets/speakwise-robot.png';
import {
  LayoutDashboard,
  Globe2,
  Volume2,
  MessageSquareCode,
  BookOpen,
  Settings,
  Palette,
  LogOut,
  Check,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    path: '/native-language',
    label: 'Native Language → English',
    icon: Globe2
  },
  {
    path: '/pronunciation',
    label: 'Pronunciation',
    icon: Volume2
  },
  {
    path: '/practice',
    label: 'Practice',
    icon: MessageSquareCode
  },
  {
    path: '/practice?tab=grammar',
    label: 'Grammar',
    icon: BookOpen
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings
  }
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showThemePicker, setShowThemePicker] = useState(false);
  const themeDropdownRef = useRef(null);

  // Close theme popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
    navigate('/login');
  };

  const currentThemeObj = themes.find(t => t.id === theme) || themes[0];

  // Helper to determine exact active state for items including Grammar tab
  const checkIsActive = (path) => {
    if (path === '/practice?tab=grammar') {
      return location.pathname === '/practice' && location.search.includes('tab=grammar');
    }
    if (path === '/practice') {
      return location.pathname === '/practice' && !location.search.includes('tab=grammar');
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar Container: Full-height fixed dark navy sidebar */}
      <aside
        className={`w-[270px] border-r flex flex-col shrink-0 transition-transform duration-300 ease-in-out z-50 lg:z-auto h-full ${
          isOpen
            ? 'fixed top-0 left-0 bottom-0 shadow-2xl translate-x-0'
            : 'fixed -translate-x-full lg:static lg:translate-x-0'
        }`}
        style={{
          backgroundColor: '#071A33',
          borderColor: '#132d54',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* TOP: 🤖 SpeakWise AI Header & Branding Area */}
        <div
          className="p-4 sm:p-4.5 border-b shrink-0 flex flex-col gap-2.5"
          style={{ borderColor: '#132d54' }}
        >
          <div
            onClick={() => {
              navigate('/dashboard');
              if (window.innerWidth < 1024 && onClose) onClose();
            }}
            className="cursor-pointer group"
          >
            {/* Logo + Brand Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-[#0e274c] border border-[#1b3d73] shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={robotAvatar}
                    alt="SpeakWise AI Assistant"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[21px] font-bold text-white tracking-tight leading-none">
                  SpeakWise AI
                </div>
              </div>

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClose) onClose();
                }}
                className="lg:hidden p-1.5 rounded-xl border hover:bg-[#0e2c56] transition cursor-pointer text-white shrink-0"
                style={{ borderColor: '#1b3d73' }}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subtitle: 12-13px, weight 400, light/white, max 2 lines */}
            <div className="mt-2.5 text-[12.5px] font-normal text-[#e2e8f0] leading-snug">
              Your Smart Marathi to English<br />
              Practice Partner
            </div>

            {/* Tagline: 11-12px, weight 400, slightly lighter, max 2 lines, italic */}
            <div className="mt-2 text-[11.5px] font-normal italic text-[#93c5fd] leading-relaxed">
              "Think in Marathi. Speak in English.<br />
              Speak with Confidence."
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = checkIsActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[17px] font-medium transition-all duration-200 group cursor-pointer ${
                  active
                    ? 'bg-[#2563eb] text-white font-semibold shadow-[0_4px_14px_rgba(37,99,235,0.45)]'
                    : 'text-white hover:bg-[#0e2c56] hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : 'text-blue-300 group-hover:text-white'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  {item.path === '/native-language' ? (
                    <div className="leading-snug">
                      Native Language <span className="inline-block whitespace-nowrap">→ English</span>
                    </div>
                  ) : (
                    <div className="truncate leading-tight">{item.label}</div>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* BOTTOM OF SIDEBAR: 🎨 Theme & 🚪 Log Out */}
        <div
          ref={themeDropdownRef}
          className="mt-auto p-3.5 sm:p-4 border-t space-y-2.5 relative shrink-0"
          style={{ borderColor: '#132d54' }}
        >
          {/* Theme Popover when open */}
          {showThemePicker && (
            <div
              className="absolute bottom-full left-3.5 right-3.5 mb-2 rounded-2xl p-2.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: '#0c2345',
                borderColor: '#2563eb',
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.7)'
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 mb-1 text-blue-200">
                Choose Theme
              </div>
              <div className="space-y-1">
                {themes.map((t) => {
                  const active = t.id === theme;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        changeTheme(t.id);
                        setShowThemePicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[#2563eb] text-white font-semibold'
                          : 'text-white hover:bg-[#153a70]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                      {active && <Check size={16} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🎨 Theme Button */}
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[17px] font-medium border transition-all duration-200 cursor-pointer ${
              showThemePicker
                ? 'bg-[#0e2c56] border-[#2563eb] text-white'
                : 'bg-[#0a2142] border-[#163561] text-white hover:bg-[#0e2c56]'
            }`}
            title="Change Appearance Theme"
          >
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-blue-300 shrink-0" />
              <span className="text-white font-semibold">Theme</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-lg shrink-0 bg-[#153a70] text-white border border-[#235194]">
              <span>{currentThemeObj.icon}</span>
              <span>{currentThemeObj.name}</span>
            </span>
          </button>

          {/* 🚪 Log Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[17px] font-semibold border transition-all duration-200 cursor-pointer bg-[#0a2142] border-[#163561] text-white hover:bg-rose-950/50 hover:border-rose-700"
            title="Log Out of SpeakWise AI"
          >
            <LogOut size={20} className="shrink-0 text-rose-400" />
            <span className="text-white font-semibold">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
