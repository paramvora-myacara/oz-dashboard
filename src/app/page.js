// src/app/page.js

import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';

export default function HomePage() {
  return (
    <>
      {/* Map Visualization - Full Screen */}
      <section className="h-screen w-full">
        <ClientOZMapLoader />
      </section>

      {/* Action Buttons - Centered below the map */}
      <section className="bg-black py-16 flex items-center justify-center">
        <div className="flex flex-col sm:flex-row gap-6 animate-fadeIn">
          <button
            className="border-2 border-white px-8 py-4 rounded-full text-white text-lg font-medium hover:bg-[#28b34f] focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.02)' }}
          >
            Check if your development is an OZ
          </button>
          <button
            className="border-2 border-white px-8 py-4 rounded-full text-white text-lg font-medium hover:bg-[#28b34f] focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-md"
            style={{ background: 'rgba(255, 255, 255, 0.02)' }}
          >
            Check if you can invest in an OZ
          </button>
        </div>
      </section>

      {/* Stats Section - Seamless Transition */}
      <section className="bg-black">
        <ModernKpiDashboard />
      </section>
    </>
  );
}