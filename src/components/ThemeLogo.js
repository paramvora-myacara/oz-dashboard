'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ThemeLogo() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();

    // Create observer to watch for theme changes
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="h-6 w-[120px] bg-black/5 dark:bg-white/5 animate-pulse rounded" />
    );
  }

  return (
    <Image 
      src={isDarkMode ? "/OZListings-Dark.png" : "/OZListings-Light.jpeg"} 
      alt="OZ Listings" 
      width={120} 
      height={40} 
      className="h-6 w-auto object-contain"
      priority
      quality={100}
    />
  );
} 