import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StreakCelebration } from '../components/streak/StreakCelebration';
import {
  Flame,
  Calendar as CalendarIcon,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

export const Streak = () => {
  const { token } = useAuth();

  const [streakStatus, setStreakStatus] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    practicedToday: false
  });

  const [calendarData, setCalendarData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    calendarDays: [],
    totalPracticedDays: 0
  });

  const [loading, setLoading] = useState(true);
  const [celebrateStreak, setCelebrateStreak] = useState(null);

  useEffect(() => {
    fetchStreakData(calendarData.year, calendarData.month);
  }, [calendarData.year, calendarData.month]);

  const fetchStreakData = async (year, month) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/streak/calendar?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCalendarData(data.calendar);
        setStreakStatus({
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          practicedToday: data.practicedToday
        });
      }
    } catch (e) {
      console.warn('Failed to load streak calendar:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    let newMonth = calendarData.month - 1;
    let newYear = calendarData.year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCalendarData(prev => ({ ...prev, year: newYear, month: newMonth }));
  };

  const handleNextMonth = () => {
    let newMonth = calendarData.month + 1;
    let newYear = calendarData.year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setCalendarData(prev => ({ ...prev, year: newYear, month: newMonth }));
  };

  // Check-in activity directly to extend streak
  const handleQuickCheckin = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/streak/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activityType: 'checkin', details: 'Daily learning check-in' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.streak.streakIncreased) {
          setCelebrateStreak(data.streak.currentStreak);
        }
        fetchStreakData(calendarData.year, calendarData.month);
      }
    } catch (e) {
      console.error('Checkin error:', e);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-primary)' }}>
              <Sparkles size={14} /> Daily Discipline Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
              🔥 My Learning Streak
            </h1>
            <p className="text-sm font-medium mt-1 max-w-xl" style={{ color: 'var(--text-muted)' }}>
              Consistency is the secret to English mastery. Practice daily to keep your flame burning bright!
            </p>
          </div>

          {/* Quick Check-in Button */}
          {!streakStatus.practicedToday && (
            <button
              onClick={handleQuickCheckin}
              className="px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-lg transition hover:scale-105 cursor-pointer flex items-center gap-2 shrink-0"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <Zap size={16} />
              <span>Complete Today's Check-in</span>
            </button>
          )}
        </div>
      </div>

      {/* Streak Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Current Streak */}
        <div
          className="p-6 rounded-3xl border shadow-xs flex items-center gap-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: streakStatus.currentStreak > 0 ? '#f97316' : 'var(--border-main)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
            <Flame size={36} className="text-orange-500 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Current Streak
            </span>
            <div className="text-3xl font-black" style={{ color: 'var(--text-main)' }}>
              {streakStatus.currentStreak} {streakStatus.currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {streakStatus.practicedToday ? 'Practiced today! 🎉' : 'Needs practice today'}
            </p>
          </div>
        </div>

        {/* Card 2: Longest Streak */}
        <div
          className="p-6 rounded-3xl border shadow-xs flex items-center gap-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
            <Trophy size={36} className="text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Best Streak
            </span>
            <div className="text-3xl font-black" style={{ color: 'var(--text-main)' }}>
              {streakStatus.longestStreak} {streakStatus.longestStreak === 1 ? 'Day' : 'Days'}
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Personal record milestone
            </p>
          </div>
        </div>

        {/* Card 3: Total Active Days */}
        <div
          className="p-6 rounded-3xl border shadow-xs flex items-center gap-5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <CalendarIcon size={36} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Days This Month
            </span>
            <div className="text-3xl font-black" style={{ color: 'var(--text-main)' }}>
              {calendarData.totalPracticedDays} Days
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Meaningful sessions
            </p>
          </div>
        </div>
      </div>

      {/* Streak Calendar View */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              {monthNames[calendarData.month - 1]} {calendarData.year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
              style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
              style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>🟢 Practiced Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-white/10 border border-white/20" />
            <span>⚪ Not Practiced</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-xs font-bold py-1" style={{ color: 'var(--text-muted)' }}>
              {d}
            </div>
          ))}

          {calendarData.calendarDays.map((day) => {
            const isToday = new Date().toISOString().split('T')[0] === day.date;
            return (
              <div
                key={day.date}
                className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center border transition-all duration-200 ${
                  day.practiced
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                    : 'border-transparent text-gray-400'
                } ${isToday ? 'ring-2 ring-purple-400' : ''}`}
                style={{
                  backgroundColor: day.practiced ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)'
                }}
              >
                <span className="text-xs sm:text-sm font-semibold">{day.day}</span>
                {day.practiced ? (
                  <span className="text-[10px] leading-none">🟢</span>
                ) : (
                  <span className="text-[10px] opacity-40">⚪</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Rules Card */}
      <div
        className="rounded-3xl p-6 border shadow-xs space-y-3"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
          📋 Streak Rules & Guidelines
        </h3>
        <ul className="text-xs space-y-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>Complete at least <b>1 meaningful learning activity</b> each day (AI chat message, pronunciation attempt, translation practice, or check-in) to count as practiced.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>Consecutive days increase your streak count: Day 1 → 1, Day 2 → 2, Day 3 → 3.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <span>If you miss a day, your current streak will reset to 1 on your next practice session.</span>
          </li>
        </ul>
      </div>

      {/* Streak Celebration Modal */}
      {celebrateStreak !== null && (
        <StreakCelebration
          streakDays={celebrateStreak}
          onClose={() => setCelebrateStreak(null)}
        />
      )}
    </div>
  );
};
