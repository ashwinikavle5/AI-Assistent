import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const displayName = user?.name || 'Ashwini Kawale';

  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-md shrink-0 transition-colors z-20"
      style={{
        backgroundColor: 'rgba(var(--bg-surface), 0.95)',
        borderColor: 'var(--border-main)'
      }}
    >
      {/* Left: Mobile Menu Toggle (hidden on desktop) + subtle coach tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border hover:opacity-80 transition cursor-pointer"
          style={{ borderColor: 'var(--border-main)', color: 'var(--text-main)' }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div
          className="hidden sm:block text-xs font-semibold tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          English Learning & Speaking Coach
        </div>
      </div>

      {/* Right: User Profile Badge Only */}
      <div className="flex items-center gap-3 ml-auto">
        <div
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border shadow-xs select-none"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
              {displayName}
            </span>
            <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: 'var(--text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
