'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SlideContainer({ slides, renderSlides, className = '' }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const lastScrollTime = useRef(0);
  const scrollAccumulator = useRef(0);
  const lastSlideChangeTime = useRef(0);
  const scrollDirection = useRef(0);
  const directionConsistency = useRef(0);
  const router = useRouter();

  // Updated scroll thresholds for more gradual behavior
  const SCROLL_THRESHOLD = 80; // Reduced from 250 to 80 for more responsive scrolling
  const SCROLL_DEBOUNCE = 100; // Reduced from 300 to 100ms for quicker response
  const TRANSITION_DURATION = 400; // Reduced from 600 to 400ms for snappier transitions

  // Function to change slides
  const changeSlide = useCallback((newSlideIndex) => {
    if (newSlideIndex === currentSlide || isTransitioning) return;
    
    // CRITICAL: Reset accumulator and tracking immediately to prevent overshoot
    scrollAccumulator.current = 0;
    lastSlideChangeTime.current = Date.now();
    directionConsistency.current = 0;
    
    setIsTransitioning(true);

    // Get current slides
    const currentSlides = renderSlides && typeof renderSlides === 'function' 
      ? renderSlides((idx) => {}) // Pass a dummy function for initial call
      : typeof slides === 'function' 
        ? slides((idx) => {}) 
        : slides;

    // Update URL hash
    const slideId = currentSlides[newSlideIndex]?.id || `slide-${newSlideIndex}`;
    window.history.replaceState(null, '', `#${slideId}`);

    // Delay the actual slide change to allow for loading state
    setTimeout(() => {
      setCurrentSlide(newSlideIndex);
      
      // Reset transition state after slide change
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200); // Reduced transition time
    }, 100); // Reduced delay for more responsive feel
  }, [currentSlide, isTransitioning, slides, renderSlides]);

  // Get slides - either from the slides prop or by calling renderSlides with changeSlide
  const getSlides = useCallback(() => {
    if (renderSlides && typeof renderSlides === 'function') {
      return renderSlides(changeSlide);
    }
    return typeof slides === 'function' ? slides(changeSlide) : slides;
  }, [slides, renderSlides, changeSlide]);

  // Handle scroll events with Mac trackpad momentum protection
  const handleScroll = useCallback((event) => {
    if (isTransitioning) {
      event.preventDefault();
      return;
    }

    const now = Date.now();
    const deltaY = event.deltaY;
    const timeSinceLastSlide = now - lastSlideChangeTime.current;

    // CRITICAL: Ignore scroll events for 600ms after slide change (Mac trackpad momentum period)
    if (timeSinceLastSlide < 600) {
      event.preventDefault();
      return;
    }

    // Detect Mac trackpad vs mouse wheel
    const isMacTrackpad = Math.abs(deltaY) < 50 && deltaY % 1 !== 0;
    const isMouseWheel = Math.abs(deltaY) >= 100;
    
    // Different debounce times for different input types
    const debounceTime = isMacTrackpad ? 100 : 20;
    
    if (now - lastScrollTime.current < debounceTime) {
      event.preventDefault();
      return;
    }
    lastScrollTime.current = now;

    // For Mac trackpads, require direction consistency to prevent accidental triggers
    if (isMacTrackpad) {
      const currentDirection = deltaY > 0 ? 1 : -1;
      
      if (currentDirection === scrollDirection.current) {
        directionConsistency.current++;
      } else {
        directionConsistency.current = 0;
        scrollDirection.current = currentDirection;
        scrollAccumulator.current = 0; // Reset accumulator when direction changes
      }
      
      // Require 3 consistent scroll events for trackpads
      if (directionConsistency.current < 3) {
        event.preventDefault();
        return;
      }
    }

    // Accumulate scroll with input-specific behavior
    if (isMacTrackpad) {
      // For trackpads, use smaller accumulation to prevent overshooting
      scrollAccumulator.current += deltaY * 0.3; // Reduce trackpad sensitivity
    } else {
      // For mouse wheels, use full accumulation
      scrollAccumulator.current += deltaY;
    }

    // Different thresholds for different input types
    const threshold = isMacTrackpad ? 60 : isMouseWheel ? 80 : 100;

    // Check if we've scrolled enough to trigger a slide change
    if (Math.abs(scrollAccumulator.current) > threshold) {
      const direction = scrollAccumulator.current > 0 ? 1 : -1;
      const newSlide = currentSlide + direction;

      // Ensure we stay within bounds
      const currentSlides = getSlides();
      if (newSlide >= 0 && newSlide < currentSlides.length) {
        changeSlide(newSlide);
      }

      // Reset accumulator immediately after triggering
      scrollAccumulator.current = 0;
    }

    // Decay accumulator more aggressively for trackpads
    if (isMacTrackpad) {
      setTimeout(() => {
        scrollAccumulator.current *= 0.2; // Very aggressive decay for trackpads
      }, 50);
    } else {
      setTimeout(() => {
        scrollAccumulator.current *= 0.5; // Normal decay for mouse wheels
      }, SCROLL_DEBOUNCE);
    }

    // Prevent default scroll behavior
    event.preventDefault();
  }, [currentSlide, isTransitioning, getSlides, changeSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTransitioning) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          const currentSlidesDown = getSlides();
          if (currentSlide < currentSlidesDown.length - 1) {
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
          const currentSlidesEnd = getSlides();
          changeSlide(currentSlidesEnd.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isTransitioning, getSlides, changeSlide]);

  // Handle initial URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const currentSlides = getSlides();
      const slideIndex = currentSlides.findIndex(slide => slide.id === hash);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        setCurrentSlide(slideIndex);
      }
    }
  }, [getSlides, currentSlide]);

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
      const currentSlides = getSlides();
      if (deltaY > 0 && currentSlide < currentSlides.length - 1) {
        changeSlide(currentSlide + 1);
      } else if (deltaY < 0 && currentSlide > 0) {
        changeSlide(currentSlide - 1);
      }
    }
  }, [currentSlide, isTransitioning, getSlides, changeSlide]);

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
          {!isTransitioning && getSlides()[currentSlide]?.component}
        </div>
      </div>

      {/* Loading overlay during transitions */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white dark:bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-black/60 dark:text-white/60 font-light">
              {currentSlide === 0 && getSlides()[1]?.id === 'overview' ? 'Loading market overview...' : 
               currentSlide === 1 && getSlides()[0]?.id === 'map' ? 'Loading opportunity zones map...' : 
               'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Slide Indicators */}
      <div className="fixed right-80 lg:right-96 top-1/2 transform -translate-y-1/2 z-50 space-y-3 pr-8">
        {getSlides().map((slide, index) => (
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