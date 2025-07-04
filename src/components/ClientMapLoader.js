// src/components/ClientMapLoader.js

'use client';
import dynamic from 'next/dynamic';

const USMapOZ = dynamic(() => import('./USMapOZ'), {
  ssr: false,
  loading: () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center justify-center h-[600px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading opportunity zones map...</p>
      </div>
    </div>
  )
});

export default function ClientMapLoader() {
  return <USMapOZ />;
}