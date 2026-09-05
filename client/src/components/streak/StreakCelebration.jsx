import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, X, Trophy } from 'lucide-react';

export const StreakCelebration = ({ streakDays, onClose }) => {
  useEffect(() => {
    // Launch celebratory confetti bursts
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 text-center border shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          boxShadow: '0 25px 50px -12px var(--accent-glow)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-4 border border-orange-500/30">
          <Flame size={36} className="text-orange-500 fill-orange-500 animate-bounce" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/15 text-orange-400 mb-2 border border-orange-500/20">
          Streak Extended!
        </span>

        <h3 className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>
          {streakDays} Days
        </h3>

        <p className="text-sm font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
          Great job! Keep practicing every day to achieve English fluency.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md cursor-pointer hover:opacity-95"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 8px 20px var(--accent-glow)'
          }}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};
