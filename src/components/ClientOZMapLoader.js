// src/components/ClientOZMapLoader.js

// Enhanced ClientOZMapLoader.js with subtle animations

'use client';

import dynamic from 'next/dynamic';

const OZMapVisualization = dynamic(() => import('./OZMapVisualization'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-black/60 dark:text-white/60 font-light">Loading opportunity zones...</p>
      </div>
    </div>
  )
});

export default function ClientOZMapLoader({ onNavigate }) {
  return <OZMapVisualization onNavigate={onNavigate} />;
}