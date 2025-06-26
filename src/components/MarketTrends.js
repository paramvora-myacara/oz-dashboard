// src/components/MarketTrends.js

export default function MarketTrends() {
    const trends = [
      {
        category: "Hot Markets",
        title: "Southeastern States Lead Growth",
        description: "Florida, Georgia, and Texas show 35% YoY increase in OZ investments",
        impact: "High",
        trend: "up",
        stats: { growth: "+35%", volume: "$12.3B" }
      },
      {
        category: "Emerging Trend",
        title: "Tech-Focused OZ Developments",
        description: "Innovation hubs in OZs attracting venture capital and startups",
        impact: "Rising",
        trend: "up",
        stats: { deals: "127", funding: "$890M" }
      },
      {
        category: "Policy Update",
        title: "Extended Tax Benefits Proposed",
        description: "New legislation could extend OZ benefits through 2030",
        impact: "Medium",
        trend: "neutral",
        stats: { timeline: "Q2 2025", probability: "65%" }
      },
      {
        category: "Market Shift",
        title: "ESG-Focused Funds Gaining Traction",
        description: "Environmental and social impact becoming key investment criteria",
        impact: "High",
        trend: "up",
        stats: { funds: "43", aum: "$3.2B" }
      }
    ];
  
    const upcomingOpportunities = [
      { location: "Miami, FL", type: "Mixed-Use", size: "$125M", status: "Pre-launch" },
      { location: "Austin, TX", type: "Tech Campus", size: "$87M", status: "Fundraising" },
      { location: "Denver, CO", type: "Affordable Housing", size: "$45M", status: "Due Diligence" },
      { location: "Atlanta, GA", type: "Logistics Hub", size: "$210M", status: "Final Round" }
    ];
  
    return (
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Market Intelligence</h2>
          <p className="text-gray-600">Stay ahead with real-time market trends and opportunities</p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trends Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Market Trends</h3>
            {trends.map((trend, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    trend.impact === 'High' ? 'bg-red-100 text-red-700' :
                    trend.impact === 'Rising' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {trend.category}
                  </span>
                  <div className={`flex items-center ${
                    trend.trend === 'up' ? 'text-green-600' :
                    trend.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend.trend === 'up' && '↑'}
                    {trend.trend === 'down' && '↓'}
                    {trend.trend === 'neutral' && '→'}
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2">{trend.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{trend.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  {Object.entries(trend.stats).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-1">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
  
          {/* Opportunities Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Opportunities</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
              <div className="space-y-4">
                {upcomingOpportunities.map((opp, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{opp.location}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        opp.status === 'Pre-launch' ? 'bg-gray-100 text-gray-700' :
                        opp.status === 'Fundraising' ? 'bg-blue-100 text-blue-700' :
                        opp.status === 'Due Diligence' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {opp.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{opp.type}</span>
                      <span className="font-semibold text-indigo-600">{opp.size}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                View All Opportunities →
              </button>
            </div>
  
            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-2xl mb-1">🔥</div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-2xl mb-1">📈</div>
                <p className="text-sm text-gray-600">Avg IRR</p>
                <p className="text-2xl font-bold text-gray-900">18.5%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }