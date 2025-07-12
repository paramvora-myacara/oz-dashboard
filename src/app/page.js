'use client';

// src/app/page.js

import { useState } from 'react';
import SlideContainer from '@/components/SlideContainer';
import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';
import OZInvestmentReasons from '@/components/OZInvestmentReasons';
import SourcesModal from '@/components/SourcesModal';

export default function HomePage() {
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  const openSourcesModal = () => setIsSourcesModalOpen(true);
  const closeSourcesModal = () => setIsSourcesModalOpen(false);

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
      component: (
        <div className="h-full w-full bg-white dark:bg-black overflow-y-auto flex flex-col">
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
              className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
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
          <div className="absolute bottom-8 right-8 z-50 text-center flex gap-4">
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
              onClick={() => navigateToSlide(1)}
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
        </div>
      )
    }
  ];

  return (
    <>
      <SlideContainer slides={createSlides} />
      <SourcesModal 
        isOpen={isSourcesModalOpen} 
        onClose={closeSourcesModal} 
      />
    </>
  );
}