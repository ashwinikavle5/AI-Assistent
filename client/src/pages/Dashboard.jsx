import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe2,
  Volume2,
  MessageSquareCode,
  BookOpen,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dynamic user display name fallback to Ashwini
  const displayName = user?.name || 'Ashwini';

  const FEATURE_CARDS = [
    {
      id: 'native-language',
      title: 'Native Language',
      description: 'Translate Marathi into natural English',
      icon: Globe2,
      path: '/native-language',
      gradient: 'from-blue-500/15 to-indigo-500/15',
      border: 'hover:border-blue-500/50',
      badge: 'Marathi → English'
    },
    {
      id: 'pronunciation',
      title: 'Pronunciation',
      description: 'Improve your English pronunciation',
      icon: Volume2,
      path: '/pronunciation',
      gradient: 'from-emerald-500/15 to-teal-500/15',
      border: 'hover:border-emerald-500/50',
      badge: 'Phonetics & Audio'
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Practice speaking English through conversation',
      icon: MessageSquareCode,
      path: '/practice',
      gradient: 'from-purple-500/15 to-pink-500/15',
      border: 'hover:border-purple-500/50',
      badge: 'Topic Discussion'
    },
    {
      id: 'grammar',
      title: 'Grammar',
      description: 'Learn English grammar from Beginner to Advanced',
      icon: BookOpen,
      path: '/practice?tab=grammar',
      gradient: 'from-amber-500/15 to-orange-500/15',
      border: 'hover:border-amber-500/50',
      badge: 'Beginner to Advanced'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div
        className="rounded-3xl border shadow-xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              borderColor: 'rgba(168, 85, 247, 0.3)',
              color: 'var(--accent-primary)'
            }}
          >
            <Sparkles size={13} />
            <span>SpeakWise AI English Companion</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
            Welcome back, {displayName}! 👋
          </h1>

          <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Improve your English, one conversation at a time.
          </p>
        </div>
      </div>

      {/* 4 Primary Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`rounded-3xl border p-6 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:scale-101 group flex flex-col justify-between ${card.border}`}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)'
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                    style={{
                      backgroundColor: 'rgba(var(--bg-surface), 0.7)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {card.description}
                </p>
              </div>

              <div className="pt-5 mt-2 flex items-center gap-1.5 text-xs font-bold group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--accent-primary)' }}
              >
                <span>Open Section</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
