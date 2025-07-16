'use client';

// src/app/page.js

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import SlideContainer from '@/components/SlideContainer';
import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';
import OZInvestmentReasons from '@/components/OZInvestmentReasons';
import SourcesModal from '@/components/SourcesModal';

export default function HomePage() {
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [cameFromSlide, setCameFromSlide] = useState(null);

  // Callback from SlideContainer
  const handleSlideChange = useCallback((from, to) => {
    setCameFromSlide(from);
  }, []);

  const openSourcesModal = () => setIsSourcesModalOpen(true);
  const closeSourcesModal = () => setIsSourcesModalOpen(false);

  // Local component to ensure slide 2 opens scrolled to bottom
  const InvestmentReasonsSlide = ({ navigateToSlide, cameFrom }) => {
    const containerRef = useRef(null);

    // Set initial scroll position BEFORE first paint to avoid visible jump
    useLayoutEffect(() => {
      if (!containerRef.current) return;
      if (cameFrom === 2) {
        // Coming from slide 3 → scroll bottom
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } else {
        // Ensure at top
        containerRef.current.scrollTop = 0;
      }
    }, [cameFrom]);

    return (
      <div ref={containerRef} className="h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col">
        <div className="flex-1">
          <OZInvestmentReasons />
        </div>
        {/* Navigation hints positioned in bottom right */}
        <div className="absolute bottom-8 right-8 z-50 text-center flex gap-4">
          <div
            className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
            onClick={() => navigateToSlide(0)}
          >
            <svg
              className="w-4 h-4 animate-bounce flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDuration: '1.5s' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
            </svg>
            <span className="leading-none">Back to map</span>
          </div>
          <div
            className="bg-black/10 dark:bg:white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg:white/20 transition-all duration-300"
            onClick={() => navigateToSlide(2)}
          >
            <span>Market overview</span>
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDuration: '1.5s' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Overview slide with conditional scrollbar visibility
  const OverviewSlide = ({ navigateToSlide }) => {
    const containerRef = useRef(null);
    const [hideScroll, setHideScroll] = useState(false);

    // Recalculate on resize and when sources modal opens/closes
    const calculateScrollbar = useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      setHideScroll(el.scrollHeight <= el.clientHeight + 1); // +1 for rounding
    }, []);

    useEffect(() => {
      calculateScrollbar();
      window.addEventListener('resize', calculateScrollbar);
      return () => window.removeEventListener('resize', calculateScrollbar);
    }, [calculateScrollbar]);

    // Re-run when modal toggles (layout shift)
    useEffect(() => {
      calculateScrollbar();
    }, [isSourcesModalOpen, calculateScrollbar]);

    return (
      <div
        ref={containerRef}
        className={`h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col snap-y snap-mandatory ${
          hideScroll ? 'hide-scrollbar' : ''
        }`}
      >
        {/* Market overview content */}
        <div className="flex-1 snap-start">
          <ModernKpiDashboard />
        </div>
        {/* Navigation hints positioned in bottom right of overview */}
        <div 
          className="absolute bottom-8 right-8 z-50 text-center flex gap-4"
        >
          <div 
            className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
            onClick={openSourcesModal}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Sources</span>
          </div>
          <div 
            className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
            onClick={() => {
              if (navigateToSlide) navigateToSlide(1);
            }}
          >
            <span>Back to investment reasons</span>
            <svg 
              className="w-4 h-4 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDuration: '1.5s' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
            </svg>
          </div>
        </div>
        {/* Disclaimer Section */}
        <hr className="border-black/10 dark:border-white/10 my-8 mx-6 snap-start" />
        <footer id="oz-disclaimer" className="snap-start px-8 py-12 text-xs leading-relaxed text-black/60 dark:text-white/60 max-w-4xl mx-auto text-center">
          OZ Listings is a marketing platform and does not offer, solicit, or sell securities. The information provided on this website is for general informational purposes only and should not be construed as investment, tax, or legal advice. OZ Listings does not operate as a broker-dealer, funding portal, or investment adviser and does not recommend or endorse any specific securities, offerings, or issuers. All investments carry risk, including the potential loss of principal. Opportunity Zone investments are subject to complex IRS rules and may not be suitable for all investors. Eligibility for associated tax benefits depends on a variety of factors and should be evaluated in consultation with your own legal, tax, and financial advisors. OZ Listings makes no representations or warranties as to the accuracy, completeness, or timeliness of any third-party project information, financial projections, or associated content.
        </footer>
      </div>
    );
  };

  // Define slides for the slide deck with navigation callbacks
  const createSlides = (navigateToSlide) => [
    {
      id: 'map',
      title: 'Opportunity Zone Map',
      component: (
        <div className="h-full w-full">
          <ClientOZMapLoader onNavigate={navigateToSlide} />
        </div>
      )
    },
    {
      id: 'investment-reasons',
      title: 'Why Invest in OZs',
      component: <InvestmentReasonsSlide navigateToSlide={navigateToSlide} cameFrom={cameFromSlide} />
    },
    {
      id: 'overview',
      title: 'Market Overview',
      component: <OverviewSlide navigateToSlide={navigateToSlide} />
    }
  ];

  return (
    <>
      <SlideContainer slides={createSlides} onSlideChange={handleSlideChange} />
      <SourcesModal 
        isOpen={isSourcesModalOpen} 
        onClose={closeSourcesModal} 
      />
    </>
  );
}