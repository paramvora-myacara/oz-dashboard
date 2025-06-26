'use client';

import dynamic from 'next/dynamic';

const OZMapVisualization = dynamic(() => import('./OZMapVisualization'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-400">Loading opportunity zones...</p>
      </div>
    </div>
  )
});

export default function ClientOZMapLoader() {
  return <OZMapVisualization />;
} 