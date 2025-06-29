'use client';

// src/app/page.js

import SlideContainer from '@/components/SlideContainer';
import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';

export default function HomePage() {
  // Define slides for the slide deck
  const slides = [
    {
      id: 'map',
      title: 'Opportunity Zone Map',
      component: (
        <div className="h-full w-full relative">
          <ClientOZMapLoader />
          {/* Navigation hints positioned in bottom right of map */}
          <div className="absolute bottom-8 right-8 z-50 text-center">
            <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60">
              Scroll down for market overview
            </div>
            <div className="mt-2 animate-bounce">
              <svg 
                className="w-6 h-6 mx-auto text-black/40 dark:text-white/40" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
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
            <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60">
              Scroll up to return to map
            </div>
            <div className="mt-2 animate-bounce">
              <svg 
                className="w-6 h-6 mx-auto text-black/40 dark:text-white/40" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                />
              </svg>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <SlideContainer slides={slides} />
  );
}