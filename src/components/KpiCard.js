export default function KpiCard({ title, value, description }) {
  return (
    <div className="bg-bg-card p-4 rounded-xl shadow hover:shadow-lg transition">
      <h4 className="text-sm font-medium text-brand-secondary mb-1 truncate">{title}</h4>
      <div className="text-2xl font-bold text-brand-dark mb-1">{value}</div>
      <p className="text-xs text-text-secondary">{description}</p>
    </div>
  );
} 