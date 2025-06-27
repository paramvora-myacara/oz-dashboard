// src/app/page.js

import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';
import ActionButtons from '@/components/ActionButtons';

export default function HomePage() {
  return (
    <>
      {/* Map Visualization - Full Screen */}
      <section className="h-screen w-full">
        <ClientOZMapLoader />
      </section>

      {/* Action Buttons - Centered below the map */}
      <section className="bg-white dark:bg-black py-8 flex items-center justify-center">
        <ActionButtons />
      </section>

      {/* Stats Section - Seamless Transition */}
      <section className="bg-white dark:bg-black">
        <ModernKpiDashboard />
      </section>
    </>
  );
}