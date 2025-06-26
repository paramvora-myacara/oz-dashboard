// src/components/ModernKpiDashboard.js

'use client';
import { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

export default function ModernKpiDashboard() {
    const [activeChart, setActiveChart] = useState('investment');
    
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

    // Chart Data
    const investmentTrendData = {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024', 'Q1 2025'],
      datasets: [
        {
          label: 'Cumulative Investment ($B)',
          data: [12, 28, 45, 68, 88, 105, 115],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Annual New Capital ($B)',
          data: [12, 16, 17, 23, 20, 17, 10],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const statePerformanceData = {
      labels: ['CA', 'TX', 'FL', 'NY', 'GA', 'OH', 'PA', 'IL', 'AZ', 'NC'],
      datasets: [
        {
          label: 'Investment ($B)',
          data: [18.2, 14.5, 12.3, 11.8, 9.2, 7.8, 6.5, 8.1, 7.5, 7.1],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 8
        },
        {
          label: 'ROI (%)',
          data: [26, 28, 32, 22, 30, 24, 20, 21, 27, 26],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderRadius: 8
        }
      ]
    };

    const sectorGrowthData = {
      labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
      datasets: [
        {
          label: 'Real Estate',
          data: [3.2, 3.5, 3.8, 4.1, 4.3],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: false
        },
        {
          label: 'Tech/Innovation',
          data: [1.5, 1.8, 2.2, 2.7, 3.1],
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          fill: false
        },
        {
          label: 'Manufacturing',
          data: [0.8, 0.9, 1.0, 1.1, 1.2],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: false
        },
        {
          label: 'Healthcare',
          data: [0.5, 0.6, 0.8, 1.0, 1.1],
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          fill: false
        }
      ]
    };

    const fundTypeData = {
      labels: ['National Funds', 'Regional Funds', 'Single-Asset', 'Sector-Specific'],
      datasets: [{
        data: [54, 22, 15, 9],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderWidth: 0
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgb(156, 163, 175)',
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgb(75, 85, 99)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(75, 85, 99, 0.2)' },
          ticks: { color: 'rgb(156, 163, 175)' }
        },
        y: {
          grid: { color: 'rgba(75, 85, 99, 0.2)' },
          ticks: { color: 'rgb(156, 163, 175)' }
        }
      }
    };
  
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Market Overview</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        {/* Charts Section */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'investment', label: 'Investment Trends' },
              { id: 'state', label: 'State Performance' },
              { id: 'sector', label: 'Sector Growth' },
              { id: 'fund', label: 'Fund Distribution' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeChart === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6" style={{ height: '400px' }}>
            {activeChart === 'investment' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Investment Growth Trajectory</h3>
                <Line data={investmentTrendData} options={chartOptions} />
              </div>
            )}
            
            {activeChart === 'state' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Top 10 States by Performance</h3>
                <Bar data={statePerformanceData} options={chartOptions} />
              </div>
            )}
            
            {activeChart === 'sector' && (
              <div className="h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Sector Investment Growth (Quarterly)</h3>
                <Line data={sectorGrowthData} options={chartOptions} />
              </div>
            )}
            
            {activeChart === 'fund' && (
              <div className="h-full flex items-center justify-around">
                <div className="w-64 h-64">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Fund Type Distribution</h3>
                  <Doughnut 
                    data={fundTypeData} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <p className="text-sm font-medium">Key Insights:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• National funds dominate with 54% share</li>
                      <li>• Average fund size: $380M</li>
                      <li>• 13 new QOFs formed monthly</li>
                      <li>• 87% capital deployment rate</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }