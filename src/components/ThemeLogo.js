'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ThemeLogo() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const homepageUrl = process.env.NEXT_PUBLIC_HOMEPAGE_URL || '/';

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
      <div 
        className="bg-black/5 dark:bg-white/5 animate-pulse rounded"
        style={{
          height: 'clamp(12px, 1.5vw, 24px)',
          width: 'clamp(36px, 5.6vw, 90px)'
        }}
      />
    );
  }

  return (
    <Link 
      href={homepageUrl}
      className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] inline-block"
    >
      <Image 
        src={isDarkMode ? "/OZListings-Dark.png" : "/OZListings-Light.jpeg"} 
        alt="OZ Listings" 
        width={120} 
        height={40} 
        className="w-auto object-contain"
        priority
        quality={100}
        unoptimized
        style={{
          height: 'clamp(12px, 1.5vw, 24px)',
          imageRendering: 'crisp-edges',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
    </Link>
  );
} 