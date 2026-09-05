import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Palette,
  GraduationCap,
  Volume2,
  Bell,
  Lock,
  LogOut,
  Check,
  Key,
  Sparkles,
  Shield
} from 'lucide-react';

export const Settings = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { theme, changeTheme, themes } = useTheme();
  const { playbackSpeed, changeSpeed, autoPlay, setAutoPlay } = useAudio();
  const navigate = useNavigate();

  // Local state for learning settings
  const [englishLevel, setEnglishLevel] = useState(user?.english_level || 'intermediate');
  const [dailyGoal, setDailyGoal] = useState(user?.daily_goal_minutes || 15);
  const [preferredLang, setPreferredLang] = useState(user?.preferred_lang || 'mixed');
  const [autoPlayAudio, setAutoPlayAudio] = useState(autoPlay);
  const [practiceSpeed, setPracticeSpeed] = useState(playbackSpeed);
  const [customApiKey, setCustomApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', text: '' });

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
          auto_play_audio: autoPlayAudio,
          api_key: customApiKey.trim() || undefined
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
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (e) {
      console.error('Settings save error:', e);
      setSaveStatus('Failed to save settings.');
    }
  };

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
          <Sparkles size={14} /> Preferences & Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
          Customize your learning pace, themes, voice speeds, and account security.
        </p>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. Appearance & Themes */}
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
          Select from 6 premium responsive themes. Changes apply instantly across the entire interface.
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
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Preset theme</div>
                  </div>
                </div>
                {active && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Learning Preferences */}
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
            Learning Curriculum & Goals
          </h2>
        </div>

        {/* English Level */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Your English Level
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

        {/* Daily Goal */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Daily Practice Goal
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

        {/* Language Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Language Assistance Mode
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
      </div>

      {/* 3. Voice & Speech Settings */}
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

        {/* Playback Speed */}
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
              Automatically read new AI tutor chat messages using text-to-speech.
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
          Save Preferences
        </button>
      </div>

      {/* 4. Security & Account Management */}
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
              End your active session on this browser.
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
