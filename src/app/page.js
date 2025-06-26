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

      {/* Stats Section - Seamless Transition */}
      <section className="bg-black">
        <ModernKpiDashboard />
      </section>
    </>
  );
}