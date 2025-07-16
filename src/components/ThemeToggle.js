'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(THEME_MODES.DARK);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', newTheme === THEME_MODES.DARK);
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || THEME_MODES.DARK;
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
    );
  }

  const getIcon = () => {
    switch (theme) {
      case THEME_MODES.LIGHT:
        return <Sun className="h-5 w-5" />;
      case THEME_MODES.DARK:
        return <Moon className="h-5 w-5" />;
      default:
        return <Moon className="h-5 w-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case THEME_MODES.LIGHT:
        return 'Light mode';
      case THEME_MODES.DARK:
        return 'Dark mode';
      default:
        return 'Dark mode';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 glass-card rounded-2xl text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all active:scale-95 group bg-white/80 dark:bg-black/20 backdrop-blur-2xl border border-black/10 dark:border-white/10"
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
} 