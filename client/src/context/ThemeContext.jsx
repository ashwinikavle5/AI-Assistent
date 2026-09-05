import React, { createContext, useContext, useState, useEffect } from 'react';

const THEMES = [
  { id: 'purple', name: 'Purple Dream', icon: '💜', color: '#8b5cf6' },
  { id: 'light', name: 'Light', icon: '☀️', color: '#6366f1' },
  { id: 'dark', name: 'Dark', icon: '🌙', color: '#3b82f6' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', color: '#06b6d4' },
  { id: 'forest', name: 'Forest', icon: '🌿', color: '#10b981' },
  { id: 'sunset', name: 'Sunset', icon: '🌅', color: '#f97316' }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('speakwise_theme') || 'purple';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('speakwise_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (THEMES.some(t => t.id === newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
