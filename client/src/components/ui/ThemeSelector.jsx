import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

export const ThemeSelector = ({ compact = false }) => {
  const { theme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = themes.find(t => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border hover:opacity-90 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)'
        }}
        title="Change Theme"
      >
        <Palette size={15} style={{ color: 'var(--accent-primary)' }} />
        {!compact && (
          <span className="flex items-center gap-1.5">
            <span>{currentThemeObj.icon}</span>
            <span>{currentThemeObj.name}</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-48 rounded-2xl p-2 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)',
            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.5)'
          }}
        >
          <div className="text-[11px] font-semibold px-2 py-1 mb-1" style={{ color: 'var(--text-muted)' }}>
            CHOOSE THEME
          </div>
          <div className="space-y-1">
            {themes.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    changeTheme(t.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--bg-card-hover)' : 'transparent',
                    color: active ? 'var(--accent-primary)' : 'var(--text-main)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{t.icon}</span>
                    <span>{t.name}</span>
                  </div>
                  {active && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
