import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Edit3,
  Check,
  X,
  Palette,
  GraduationCap,
  Volume2,
  Lock,
  LogOut,
  Sparkles,
  Shield,
  Flame,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export const Settings = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const { playbackSpeed, changeSpeed, autoPlay, setAutoPlay } = useAudio();
  const navigate = useNavigate();

  // Profile Information State
  const [name, setName] = useState(user?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState('');

  // Learning & Voice Preferences State
  const [englishLevel, setEnglishLevel] = useState(user?.english_level || 'intermediate');
  const [dailyGoal, setDailyGoal] = useState(user?.daily_goal_minutes || 15);
  const [preferredLang, setPreferredLang] = useState(user?.preferred_lang || 'mixed');
  const [autoPlayAudio, setAutoPlayAudio] = useState(autoPlay);
  const [practiceSpeed, setPracticeSpeed] = useState(playbackSpeed);
  const [saveStatus, setSaveStatus] = useState('');

  // Quick stats summary
  const [stats, setStats] = useState({
    currentStreak: 0,
    wordsLearned: 0,
    aiConversations: 0
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    setName(user?.name || '');
    setEnglishLevel(user?.english_level || 'intermediate');
    setDailyGoal(user?.daily_goal_minutes || 15);
    setPreferredLang(user?.preferred_lang || 'mixed');
  }, [user]);

  useEffect(() => {
    const fetchQuickStats = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/progress/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.stats) {
          setStats({
            currentStreak: data.stats.currentStreak || 0,
            wordsLearned: data.stats.wordsLearned || 0,
            aiConversations: data.stats.aiConversations || 0
          });
        }
      } catch (e) {
        // Silently handle
      }
    };
    fetchQuickStats();
  }, [token]);

  // Save Name in Profile Card
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateUser({ name: name.trim() });
        setIsEditingName(false);
        setProfileSaveStatus('Name updated successfully!');
        setTimeout(() => setProfileSaveStatus(''), 3000);
      }
    } catch (e) {
      console.error('Error updating name:', e);
    }
  };

  // Save Preferences
  const handleSaveSettings = async () => {
    setSaveStatus('');
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          theme,
          english_level: englishLevel,
          daily_goal_minutes: dailyGoal,
          preferred_lang: preferredLang,
          speech_speed: practiceSpeed,
          auto_play_audio: autoPlayAudio
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateUser({
          english_level: englishLevel,
          daily_goal_minutes: dailyGoal,
          preferred_lang: preferredLang
        });
        setAutoPlay(autoPlayAudio);
        changeSpeed(practiceSpeed);
        setSaveStatus('Preferences saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (e) {
      console.error('Settings save error:', e);
      setSaveStatus('Failed to save settings.');
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', text: '' });

    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordStatus({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (e) {
      setPasswordStatus({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-primary)' }}>
          <Sparkles size={14} /> Profile & Settings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your personal profile, appearance, language preferences, and account security.
        </p>
      </div>

      {/* 1. PROFILE SECTION (Moved into Settings as requested) */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
              Profile Information
            </h2>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5" style={{ color: 'var(--text-muted)' }}>
            Personal Account
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
          {/* User Profile Avatar (Distinct initials, NOT the robot mascot) */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 20px var(--accent-glow)'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Learner Avatar
            </span>
          </div>

          {/* User Details & Editable Name */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {!isEditingName ? (
                <div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                    {user?.name || 'English Learner'}
                  </h3>
                  <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={13} />
                    <span>{user?.email || 'learner@speakwise.ai'}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveName} className="flex-1 space-y-2">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Your Name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="px-3.5 py-2 rounded-xl border text-xs outline-none flex-1 max-w-sm"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--text-main)'
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1"
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setName(user?.name || '');
                      }}
                      className="px-3 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                      style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </form>
              )}

              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer flex items-center gap-1.5 self-start"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <Edit3 size={13} />
                  <span>Edit Name</span>
                </button>
              )}
            </div>

            {profileSaveStatus && (
              <p className="text-xs text-emerald-400 font-semibold">{profileSaveStatus}</p>
            )}

            {/* Profile Statistics Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                <Flame size={13} className="text-orange-400 fill-orange-400" />
                <span>{stats.currentStreak} Day Streak</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <MessageSquare size={13} />
                <span>{stats.aiConversations} Conversations</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <BookOpen size={13} />
                <span>{stats.wordsLearned} Words Practiced</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 2. APPEARANCE & THEMES */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2">
          <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
            Appearance & Themes
          </h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Select from 6 responsive themes. Changes apply instantly across the entire interface.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  active ? 'ring-2 ring-purple-500 scale-[1.02] shadow-md' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-main)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{t.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Theme Preset</div>
                  </div>
                </div>
                {active && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LANGUAGE & LEARNING PREFERENCES */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2">
          <GraduationCap size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
            Language & Learning Preferences
          </h2>
        </div>

        {/* English Learning Level */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            English Learning Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'beginner', label: 'Beginner', desc: 'Basic everyday English' },
              { id: 'intermediate', label: 'Intermediate', desc: 'Conversational fluency' },
              { id: 'advanced', label: 'Advanced', desc: 'Professional vocabulary' }
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setEnglishLevel(lvl.id)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  englishLevel === lvl.id ? 'ring-2 ring-purple-500 font-bold' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: englishLevel === lvl.id ? 'var(--accent-primary)' : 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              >
                <div className="text-xs font-bold">{lvl.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Preferred Language Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'english', label: '🇬🇧 English Only' },
              { id: 'marathi', label: '🇮🇳 Marathi Only' },
              { id: 'mixed', label: '🔄 Marathi + English' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setPreferredLang(lang.id)}
                className={`py-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                  preferredLang === lang.id ? 'ring-2 ring-purple-500 font-bold' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: preferredLang === lang.id ? 'var(--accent-primary)' : 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Practice Goal */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Daily Practice Target
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[5, 10, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setDailyGoal(mins)}
                className={`py-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                  dailyGoal === mins ? 'ring-2 ring-purple-500 font-bold' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: dailyGoal === mins ? 'var(--accent-primary)' : 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 rounded-2xl text-white font-semibold text-xs shadow-md transition hover:scale-105 cursor-pointer"
          style={{ background: 'var(--accent-gradient)' }}
        >
          Save Learning Preferences
        </button>
      </div>

      {/* 4. VOICE & SPEECH SETTINGS */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2">
          <Volume2 size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
            Voice & Speech Settings
          </h2>
        </div>

        {/* Speech Speed */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Default AI Speech Speed
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { speed: 0.75, label: '0.75x (Learner Slow)' },
              { speed: 1.0, label: '1.0x (Standard)' },
              { speed: 1.25, label: '1.25x (Fast)' }
            ].map((s) => (
              <button
                key={s.speed}
                onClick={() => setPracticeSpeed(s.speed)}
                className={`py-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                  practiceSpeed === s.speed ? 'ring-2 ring-purple-500 font-bold' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: practiceSpeed === s.speed ? 'var(--accent-primary)' : 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Play Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
          <div>
            <div className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
              Auto-play AI Responses Aloud
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Automatically read new AI tutor chat messages aloud using speech synthesis.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoPlayAudio}
            onChange={(e) => setAutoPlayAudio(e.target.checked)}
            className="w-5 h-5 rounded cursor-pointer text-purple-600 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 rounded-2xl text-white font-semibold text-xs shadow-md transition hover:scale-105 cursor-pointer"
          style={{ background: 'var(--accent-gradient)' }}
        >
          Save Voice Settings
        </button>
      </div>

      {/* 5. ACCOUNT SECURITY & LOGOUT */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
            Account Security
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-2xl border text-xs outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)'
              }}
            />
          </div>

          {passwordStatus.text && (
            <p className={`text-xs ${passwordStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {passwordStatus.text}
            </p>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-main)'
            }}
          >
            Update Password
          </button>
        </form>

        <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-main)' }}>
          <div>
            <div className="text-xs font-bold text-red-400">Log Out of Session</div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              End your active session on this device.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-xs hover:bg-red-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
