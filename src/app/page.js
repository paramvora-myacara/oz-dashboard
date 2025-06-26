// src/app/page.js

import ModernKpiDashboard from '@/components/ModernKpiDashboard';
import ClientOZMapLoader from '@/components/ClientOZMapLoader';

export default function HomePage() {
  return (
    <>
      {/* Map Visualization */}
      <section className="h-screen">
        <ClientOZMapLoader />
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900">
        <ModernKpiDashboard />
      </section>
    </>
  );
}