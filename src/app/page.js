// src/app/page.js

import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Map Visualization - Full Screen */}
      <section className="relative h-screen">
        <ClientOZMapLoader />
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <ModernKpiDashboard />
        </div>
      </section>
    </div>
  );
}