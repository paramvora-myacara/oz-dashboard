// src/components/ModernKpiDashboard.js

export default function ModernKpiDashboard() {
    const kpis = [
      {
        title: "Total Investment",
        value: "$105.3B",
        change: "+$12.5B",
        trend: "up",
        description: "Since 2018",
        gradient: "from-green-400 to-emerald-600"
      },
      {
        title: "Active Zones",
        value: "8,764",
        change: "+156",
        trend: "up",
        description: "Nationwide",
        gradient: "from-blue-400 to-indigo-600"
      },
      {
        title: "Avg ROI",
        value: "23.7%",
        change: "+2.3%",
        trend: "up",
        description: "Annual return",
        gradient: "from-purple-400 to-pink-600"
      },
      {
        title: "Jobs Created",
        value: "2.1M",
        change: "+180K",
        trend: "up",
        description: "Direct impact",
        gradient: "from-orange-400 to-red-600"
      }
    ];
  
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Market Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}></div>
              
              <div className="relative">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">{kpi.title}</h3>
                  <div className={`flex items-center space-x-1 text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span>{kpi.change}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {kpi.trend === 'up' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
                      )}
                    </svg>
                  </div>
                </div>
                
                <p className="text-3xl font-bold text-white mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
                
                <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${kpi.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">54%</p>
            <p className="text-xs text-gray-500">National Funds</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">87%</p>
            <p className="text-xs text-gray-500">Zone Activity</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">$24.5M</p>
            <p className="text-xs text-gray-500">Avg Deal Size</p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">313K</p>
            <p className="text-xs text-gray-500">Housing Units</p>
          </div>
        </div>
      </div>
    );
  }