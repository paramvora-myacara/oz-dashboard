'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@headlessui/react';

const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(THEME_MODES.DARK);
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false)

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
    setEnabled(savedTheme === THEME_MODES.DARK)
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    
    setTheme(nextTheme);
    setEnabled(!enabled)
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
    );
  }

  return (
    <Switch
      checked={enabled}
      onChange={toggleTheme}
      className={`${
        enabled ? 'bg-gray-700' : 'bg-gray-200'
      } relative inline-flex h-8 w-14 items-center rounded-full transition-colors`}
    >
      <span
        className={`${
          enabled ? 'translate-x-7' : 'translate-x-1'
        } inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform`}
      >
        {enabled ? <Moon className="h-4 w-4 text-gray-700" /> : <Sun className="h-4 w-4 text-gray-700" />}
      </span>
    </Switch>
  );
} 