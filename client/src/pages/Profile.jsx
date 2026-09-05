import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Calendar,
  Award,
  Flame,
  BookOpen,
  MessageSquare,
  BrainCircuit,
  Edit3,
  Check,
  X,
  Sparkles
} from 'lucide-react';

export const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    wordsLearned: 0,
    aiConversations: 0,
    practiceQuestionsCompleted: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/progress/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (e) {
        console.warn('Failed to load profile stats:', e);
      }
    };

    fetchProfileStats();
  }, [token]);

  const handleSaveProfile = async (e) => {
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
        setIsEditing(false);
        setSaveStatus('Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const formattedJoinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent Learner';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Profile Header Hero Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-extrabold text-white shadow-xl shrink-0"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 12px 28px var(--accent-glow)'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
                  {user?.name || 'English Learner'}
                </h1>
                <p className="text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  <Mail size={14} />
                  <span>{user?.email || 'learner@speakwise.ai'}</span>
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-2xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--accent-primary)'
                  }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                    style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Editable Name Field */}
            {isEditing && (
              <div className="pt-2 max-w-sm">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            )}

            {saveStatus && (
              <p className="text-xs text-emerald-400 font-semibold">{saveStatus}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                🎯 {user?.english_level || 'Intermediate'} Level
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                🔥 {stats.currentStreak} Day Streak
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                📅 Joined {formattedJoinDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: `${stats.currentStreak} Days`, icon: Flame, color: 'text-orange-500' },
          { label: 'Longest Streak', value: `${stats.longestStreak} Days`, icon: Award, color: 'text-amber-400' },
          { label: 'Words Learned', value: stats.wordsLearned, icon: BookOpen, color: 'text-cyan-400' },
          { label: 'AI Conversations', value: stats.aiConversations, icon: MessageSquare, color: 'text-purple-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {item.label}
                </span>
                <Icon size={18} className={item.color} />
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Learning Profile Overview */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
          Learning Preferences & Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Proficiency Track</span>
            <p className="font-bold text-sm capitalize" style={{ color: 'var(--text-main)' }}>
              {user?.english_level || 'Intermediate'} English Learner
            </p>
          </div>

          <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Daily Commitment Goal</span>
            <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
              {user?.daily_goal_minutes || 15} Minutes Practice per Day
            </p>
          </div>

          <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Language Assistance Mode</span>
            <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
              Bilingual (Marathi + English) Enabled
            </p>
          </div>

          <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Roman Marathi Intelligence</span>
            <p className="font-bold text-sm text-emerald-400">
              Active (Phonetic Normalization On)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
