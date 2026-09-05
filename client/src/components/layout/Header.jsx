import React, { useState, useEffect } from 'react';
import { Menu, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import robotAvatar from '../../assets/speakwise-robot.png';

export const Header = ({ onMenuClick }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/streak/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.streak) {
            setStreakDays(data.streak.currentStreak);
          }
        }
      } catch (e) {
        console.warn('Could not load streak status:', e);
      }
    };

    fetchStreak();
  }, [token]);

  return (
    <header
      className="sticky top-0 z-30 h-16 px-4 lg:px-8 flex items-center justify-between border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'rgba(var(--bg-surface), 0.85)',
        borderColor: 'var(--border-main)'
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <img src={robotAvatar} alt="SpeakWise AI Assistant" className="w-7 h-7 object-contain" />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-main)' }}>
            SpeakWise <span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <button
          onClick={() => navigate('/streak')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 cursor-pointer shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: streakDays > 0 ? '#f97316' : 'var(--border-main)'
          }}
          title="View Streak Calendar"
        >
          <Flame size={16} className={streakDays > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-gray-400"} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
            {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
          </span>
          <span className="hidden sm:inline text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            • Keep streak alive!
          </span>
        </button>

        {/* AI Tutor Status */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-secondary)'
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
          <span>Marathi + English AI Ready</span>
        </div>
      </div>
    </header>
  );
};
