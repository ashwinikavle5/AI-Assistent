import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  MessageSquare,
  Volume2,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  Target,
  Bot
} from 'lucide-react';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    wordsLearned: 0,
    aiConversations: 0,
    userMessages: 0,
    practiceQuestionsCompleted: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        // Fetch stats
        const res = await fetch('/api/progress/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        }

        // Fetch real recent practice history
        const practiceRes = await fetch('/api/practice/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const practiceData = await practiceRes.json();

        // Fetch real recent pronunciation history
        const pronRes = await fetch('/api/pronunciation/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pronData = await pronRes.json();

        const combined = [];
        if (practiceData.success && practiceData.history) {
          practiceData.history.forEach(item => {
            combined.push({
              id: 'pr_' + item.id,
              type: 'practice',
              title: `Translated: "${item.marathi_sentence}"`,
              subtitle: item.is_correct ? 'Correct English Translation' : 'Needs Practice',
              date: item.created_at,
              icon: BrainCircuit,
              color: 'text-emerald-400'
            });
          });
        }

        if (pronData.success && pronData.history) {
          pronData.history.forEach(item => {
            combined.push({
              id: 'pron_' + item.id,
              type: 'pronunciation',
              title: `Pronounced "${item.word}"`,
              subtitle: item.is_match ? 'Clear Articulation Match' : 'Spoken Check',
              date: item.created_at,
              icon: Volume2,
              color: 'text-cyan-400'
            });
          });
        }

        // Sort by most recent
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(combined.slice(0, 6));

      } catch (err) {
        console.warn('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const statCards = [
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'Day' : 'Days'}`,
      subtitle: stats.currentStreak > 0 ? 'Keep it burning!' : 'Practice today to start',
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      action: () => navigate('/streak')
    },
    {
      title: 'AI Conversations',
      value: stats.aiConversations,
      subtitle: `${stats.userMessages || 0} messages exchanged`,
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      action: () => navigate('/ai-assistant')
    },
    {
      title: 'Words Practiced',
      value: stats.wordsLearned,
      subtitle: 'Vocabulary checks logged',
      icon: Volume2,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      action: () => navigate('/pronunciation')
    },
    {
      title: 'Practice Sessions',
      value: stats.practiceQuestionsCompleted,
      subtitle: 'Marathi → English challenges',
      icon: BrainCircuit,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      action: () => navigate('/practice')
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Dynamic Header Greeting & Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-lg"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-primary)' }}>
              <Sparkles size={14} /> Your friendly AI English companion
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
              {getGreeting()}! 👋
            </h1>
            <p className="text-sm sm:text-base font-medium max-w-xl" style={{ color: 'var(--text-muted)' }}>
              Ready to practice English today?
            </p>
          </div>

          {/* Top-right Streak Badge */}
          <div
            onClick={() => navigate('/streak')}
            className="p-4 rounded-2xl border flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 shrink-0 shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: stats.currentStreak > 0 ? '#f97316' : 'var(--border-main)'
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                Current Streak
              </div>
              <div className="text-xl font-black" style={{ color: 'var(--text-main)' }}>
                🔥 {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Keep your streak alive!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Useful Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={card.action}
              className="p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 cursor-pointer shadow-xs group"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.border} border`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>
                {card.value}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {card.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Goal Section */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
                Today's Goal
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.daily_goal_minutes || 15} minutes of English practice target
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {stats.currentStreak > 0 ? 'Goal Completed! 🎉' : 'In Progress'}
          </span>
        </div>

        {/* Interactive Progress Indicator */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span style={{ color: 'var(--text-secondary)' }}>Daily Session Completion</span>
            <span style={{ color: 'var(--accent-primary)' }}>
              {stats.currentStreak > 0 ? '100%' : '35%'}
            </span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border" style={{ borderColor: 'var(--border-main)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: stats.currentStreak > 0 ? '100%' : '35%',
                background: 'var(--accent-gradient)',
                boxShadow: '0 2px 10px var(--accent-glow)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Practice Section */}
      <div className="space-y-4">
        <div>
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>
            Quick Practice
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Pick an activity to start practicing right away
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Button 1: Practice English */}
          <button
            onClick={() => navigate('/practice')}
            className="p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <BrainCircuit size={20} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                Practice English
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Translate Marathi sentences into natural English across 12 topics.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <span>Start</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 2: Talk to AI */}
          <button
            onClick={() => navigate('/ai-assistant')}
            className="p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
                <Bot size={20} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                Talk to AI
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Chat naturally in English or Roman Marathi (e.g. <i>"jevn zal ka?"</i>).
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-pink-400">
              <span>Chat</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 3: Pronunciation */}
          <button
            onClick={() => navigate('/pronunciation')}
            className="p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Volume2 size={20} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                Pronunciation
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Listen to slow audio and practice speaking into your microphone.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <span>Pronounce</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 4: Translation */}
          <button
            onClick={() => navigate('/practice')}
            className="p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
                Translation
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Daily Marathi to English sentence challenges with non-repeating questions.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span>Translate</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xs space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
              Recent Activity
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Actual learning sessions from your account
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5" style={{ color: 'var(--text-muted)' }}>
            Live Account Log
          </span>
        </div>

        {recentActivities.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <Icon size={16} className={act.color} />
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--text-main)' }}>
                        {act.title}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {act.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              No learning activity recorded yet today.
            </p>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition shadow cursor-pointer"
              style={{ background: 'var(--accent-gradient)' }}
            >
              Start Your First Practice Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
