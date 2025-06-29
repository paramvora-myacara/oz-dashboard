'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SlideContainer({ slides, className = '' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollAccumulator = useRef(0);
  const router = useRouter();

  // Scroll threshold - how much scroll is needed to trigger slide change
  const SCROLL_THRESHOLD = 250; // Increased from 100 to make less sensitive
  const SCROLL_DEBOUNCE = 300; // Increased from 150ms to make less sensitive
  const TRANSITION_DURATION = 600; // ms for slide transitions

  // Handle scroll events
  const handleScroll = useCallback((event) => {
    if (isTransitioning) {
      event.preventDefault();
      return;
    }

    const now = Date.now();
    const deltaY = event.deltaY;

    // Debounce rapid scroll events
    if (now - lastScrollTime.current < 50) {
      return;
    }
    lastScrollTime.current = now;

    // Accumulate scroll delta
    scrollAccumulator.current += deltaY;

    // Clear accumulator after debounce period
    setTimeout(() => {
      scrollAccumulator.current *= 0.7; // Increased decay from 0.9 to 0.7 for less sensitivity
    }, SCROLL_DEBOUNCE);

    // Check if we've scrolled enough to trigger a slide change
    if (Math.abs(scrollAccumulator.current) > SCROLL_THRESHOLD) {
      const direction = scrollAccumulator.current > 0 ? 1 : -1;
      const newSlide = currentSlide + direction;

      // Ensure we stay within bounds
      if (newSlide >= 0 && newSlide < slides.length) {
        changeSlide(newSlide);
      }

      // Reset accumulator
      scrollAccumulator.current = 0;
    }

    // Prevent default scroll behavior
    event.preventDefault();
  }, [currentSlide, isTransitioning, slides.length]);

  // Function to change slides
  const changeSlide = useCallback((newSlideIndex) => {
    if (newSlideIndex === currentSlide || isTransitioning) return;
    
    setIsTransitioning(true);

    // Update URL hash
    const slideId = slides[newSlideIndex]?.id || `slide-${newSlideIndex}`;
    window.history.replaceState(null, '', `#${slideId}`);

    // Delay the actual slide change to allow for loading state
    setTimeout(() => {
      setCurrentSlide(newSlideIndex);
      
      // Reset transition state after slide change
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Additional time for mounting
    }, 200); // Small delay to show loading state
  }, [currentSlide, isTransitioning, slides]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTransitioning) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          if (currentSlide < slides.length - 1) {
            changeSlide(currentSlide + 1);
          }
          break;
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          if (currentSlide > 0) {
            changeSlide(currentSlide - 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          changeSlide(0);
          break;
        case 'End':
          event.preventDefault();
          changeSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isTransitioning, slides.length, changeSlide]);

  // Handle initial URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const slideIndex = slides.findIndex(slide => slide.id === hash);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        setCurrentSlide(slideIndex);
      }
    }
  }, [slides, currentSlide]);

  // Touch/swipe handling for mobile
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((event) => {
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }, []);

  const handleTouchMove = useCallback((event) => {
    touchEnd.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (isTransitioning) return;

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // Require minimum swipe distance
    if (Math.abs(deltaY) < 50) return;

    // Vertical swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0 && currentSlide < slides.length - 1) {
        changeSlide(currentSlide + 1);
      } else if (deltaY < 0 && currentSlide > 0) {
        changeSlide(currentSlide - 1);
      }
    }
  }, [currentSlide, isTransitioning, slides.length, changeSlide]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleScroll, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleScroll);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleScroll, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Slides Container */}
      <div className="w-full h-full">
        {/* Only render the current slide - true lazy loading */}
        <div className="w-full h-full">
          {!isTransitioning && slides[currentSlide]?.component}
        </div>
      </div>

      {/* Loading overlay during transitions */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white dark:bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-black/60 dark:text-white/60 font-light">
              {currentSlide === 0 && slides[1]?.id === 'overview' ? 'Loading market overview...' : 
               currentSlide === 1 && slides[0]?.id === 'map' ? 'Loading opportunity zones map...' : 
               'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Slide Indicators */}
      <div className="fixed right-80 lg:right-96 top-1/2 transform -translate-y-1/2 z-50 space-y-3 pr-8">
        {slides.map((slide, index) => (
          <button
            key={slide.id || index}
            onClick={() => changeSlide(index)}
            disabled={isTransitioning}
            className={`block w-2 h-8 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-black dark:bg-white opacity-100'
                : 'bg-black/30 dark:bg-white/30 opacity-60 hover:opacity-80'
            } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={`Go to ${slide.title || `slide ${index + 1}`}`}
          />
        ))}
      </div>
    </div>
  );
} 