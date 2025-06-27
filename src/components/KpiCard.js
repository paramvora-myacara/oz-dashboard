// src/components/KpiCard.js

export default function KpiCard({ title, value, description, icon, gradient, change, trend }) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{icon}</div>
          {change && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{change}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {trend === 'up' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
                )}
              </svg>
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        
        <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
        </div>
      </div>
    </div>
  );
}