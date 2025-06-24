import ClientMapLoader from '@/components/ClientMapLoader';
import NationalKpiDashboard from '@/components/NationalKpiDashboard';
import InvestmentTimelineChart from '@/components/Charts/InvestmentTimelineChart';
import SectorAllocationChart from '@/components/Charts/SectorAllocationChart';
import { HousingProductionChart, PerformanceComparisonChart } from '@/components/Charts/HousingProductionChart';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <ClientMapLoader/>
      <NationalKpiDashboard/>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Cumulative Investment Timeline", Component: InvestmentTimelineChart },
          { title: "Sector Allocation", Component: SectorAllocationChart },
          { title: "Housing Production", Component: HousingProductionChart },
          { title: "OZ vs Non-OZ Performance", Component: PerformanceComparisonChart }
        ].map(({ title, Component }) => (
          <div key={title} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-brand-primary text-center mb-2">{title}</h3>
            <div className="h-64"><Component/></div>
          </div>
        ))}
      </section>
    </div>
  );
} 