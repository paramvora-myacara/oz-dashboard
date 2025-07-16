'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ThemeLogo() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

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

  const handleClick = () => {
    setIsClicked(true);
    
    // Reset click effect after animation
    setTimeout(() => setIsClicked(false), 150);
    
    // Navigate to the Vercel deployment URL
    window.open('https://vercel.com/params-projects-68d882ea/oz-homepage', '_blank', 'noopener,noreferrer');
  };

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
    <button
      onClick={handleClick}
      className={`
        group relative transition-all duration-100 ease-out cursor-pointer
        hover:scale-[1.02] active:scale-[0.98]
        ${isClicked ? 'scale-[0.98]' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent
        rounded-lg p-1
      `}
      title="Visit OZ Homepage"
      aria-label="Navigate to OZ Homepage"
    >
      {/* Click ripple effect */}
      {isClicked && (
        <div className="absolute inset-0 bg-blue-500/30 rounded-lg animate-ping" />
      )}
      
      <Image 
        src={isDarkMode ? "/OZListings-Dark.png" : "/OZListings-Light.jpeg"} 
        alt="OZ Listings" 
        width={120} 
        height={40} 
        className="w-auto object-contain relative z-10 transition-all duration-100"
        priority
        quality={100}
        unoptimized
        style={{
          height: 'clamp(12px, 1.5vw, 24px)',
          imageRendering: 'crisp-edges',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
    </button>
  );
} 