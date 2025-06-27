import KpiCard from './KpiCard';
import { nationalKpis } from '@/data/mockData';

export default function NationalKpiDashboard() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">National-Level KPIs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(nationalKpis).map(k => (
          <KpiCard key={k.title} {...k}/>
        ))}
      </div>
    </section>
  );
} 