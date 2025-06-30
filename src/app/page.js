'use client';

// src/app/page.js

import SlideContainer from '@/components/SlideContainer';
import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';

export default function HomePage() {
  
  // Define slides for the slide deck with navigation callbacks
  const createSlides = (navigateToSlide) => [
    {
      id: 'map',
      title: 'Opportunity Zone Map',
      component: (
        <div className="h-full w-full relative">
          <ClientOZMapLoader />
          {/* Navigation hints positioned in bottom right of map */}
          <div className="absolute bottom-8 right-8 z-50 text-center">
            <div 
              className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => navigateToSlide(1)}
            >
              <span>Scroll down for market overview</span>
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
      )
    },
    {
      id: 'overview',
      title: 'Market Overview',
      component: (
        <div className="h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col">
          {/* Market overview content */}
          <div className="flex-1">
            <ModernKpiDashboard />
          </div>
          {/* Navigation hints positioned in bottom right of overview */}
          <div className="absolute bottom-8 right-8 z-50 text-center">
            <div 
              className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
              onClick={() => navigateToSlide(0)}
            >
              <span>Scroll up to return to map</span>
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
        </div>
      )
    }
  ];

  return (
    <SlideContainer slides={createSlides} />
  );
}