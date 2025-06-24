'use client';
import dynamic from 'next/dynamic';

const USMap = dynamic(() => import('@/components/USMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="bg-bg-card p-6 rounded-xl shadow text-center">
      Loading map…
    </div>
  )
});

export default function ClientMapLoader() {
  return <USMap/>;
} 