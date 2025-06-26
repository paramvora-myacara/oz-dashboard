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
        icon: "📈"
      },
      {
        title: "Active Zones",
        value: "8,764",
        change: "+156",
        trend: "up",
        description: "Nationwide",
        icon: "🗺️"
      },
      {
        title: "Avg ROI",
        value: "23.7%",
        change: "+2.3%",
        trend: "up",
        description: "Annual return",
        icon: "💰"
      },
      {
        title: "Jobs Created",
        value: "2.1M",
        change: "+180K",
        trend: "up",
        description: "Direct impact",
        icon: "👥"
      }
    ];

    // Chart Data
    const investmentTrendData = {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024', 'Q1 2025'],
      datasets: [
        {
          label: 'Cumulative Investment ($B)',
          data: [12, 28, 45, 68, 88, 105, 115],
          borderColor: '#0071e3',
          backgroundColor: 'rgba(0, 113, 227, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Annual New Capital ($B)',
          data: [12, 16, 17, 23, 20, 17, 10],
          borderColor: '#30d158',
          backgroundColor: 'rgba(48, 209, 88, 0.1)',
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
          backgroundColor: 'rgba(0, 113, 227, 0.6)',
          borderRadius: 8
        },
        {
          label: 'ROI (%)',
          data: [26, 28, 32, 22, 30, 24, 20, 21, 27, 26],
          backgroundColor: 'rgba(48, 209, 88, 0.6)',
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
          borderColor: '#0071e3',
          backgroundColor: 'rgba(0, 113, 227, 0.1)',
          fill: false
        },
        {
          label: 'Tech/Innovation',
          data: [1.5, 1.8, 2.2, 2.7, 3.1],
          borderColor: '#bf5af2',
          backgroundColor: 'rgba(191, 90, 242, 0.1)',
          fill: false
        },
        {
          label: 'Manufacturing',
          data: [0.8, 0.9, 1.0, 1.1, 1.2],
          borderColor: '#30d158',
          backgroundColor: 'rgba(48, 209, 88, 0.1)',
          fill: false
        },
        {
          label: 'Healthcare',
          data: [0.5, 0.6, 0.8, 1.0, 1.1],
          borderColor: '#ff9f0a',
          backgroundColor: 'rgba(255, 159, 10, 0.1)',
          fill: false
        }
      ]
    };

    const fundTypeData = {
      labels: ['National Funds', 'Regional Funds', 'Single-Asset', 'Sector-Specific'],
      datasets: [{
        data: [54, 22, 15, 9],
        backgroundColor: [
          'rgba(0, 113, 227, 0.8)',
          'rgba(48, 209, 88, 0.8)',
          'rgba(191, 90, 242, 0.8)',
          'rgba(255, 159, 10, 0.8)'
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
            color: 'rgba(255, 255, 255, 0.7)',
            font: { 
              size: 12,
              family: '-apple-system, BlinkMacSystemFont, sans-serif'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 12,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { 
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: { 
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              family: '-apple-system, BlinkMacSystemFont, sans-serif'
            }
          }
        },
        y: {
          grid: { 
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: { 
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              family: '-apple-system, BlinkMacSystemFont, sans-serif'
            }
          }
        }
      }
    };
  
    return (
      <div className="min-h-screen bg-black px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="text-5xl font-semibold text-white tracking-tight mb-3">Market Overview</h2>
            <p className="text-xl text-white/60 font-light">Real-time analytics and investment insights</p>
          </div>
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{kpi.icon}</div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-[#30d158]' : 'text-[#ff375f]'
                  }`}>
                    <span>{kpi.change}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {kpi.trend === 'up' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
                      )}
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-white/60 mb-2">{kpi.title}</h3>
                <p className="text-4xl font-semibold text-white mb-2">{kpi.value}</p>
                <p className="text-sm text-white/40 font-light">{kpi.description}</p>
              </div>
            ))}
          </div>
    
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-3xl font-semibold text-[#0071e3]">54%</p>
              <p className="text-sm text-white/50 mt-1 font-light">National Funds</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-3xl font-semibold text-[#30d158]">87%</p>
              <p className="text-sm text-white/50 mt-1 font-light">Zone Activity</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-3xl font-semibold text-[#bf5af2]">$24.5M</p>
              <p className="text-sm text-white/50 mt-1 font-light">Avg Deal Size</p>
            </div>
            <div className="glass-card rounded-xl p-6 text-center">
              <p className="text-3xl font-semibold text-[#ff9f0a]">313K</p>
              <p className="text-sm text-white/50 mt-1 font-light">Housing Units</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'investment', label: 'Investment Trends' },
                { id: 'state', label: 'State Performance' },
                { id: 'sector', label: 'Sector Growth' },
                { id: 'fund', label: 'Fund Distribution' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    activeChart === tab.id
                      ? 'bg-white text-black'
                      : 'glass-card text-white/70 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="glass-card rounded-3xl p-8" style={{ height: '480px' }}>
              {activeChart === 'investment' && (
                <div className="h-full">
                  <h3 className="text-2xl font-semibold text-white mb-6">Investment Growth Trajectory</h3>
                  <Line data={investmentTrendData} options={chartOptions} />
                </div>
              )}
              
              {activeChart === 'state' && (
                <div className="h-full">
                  <h3 className="text-2xl font-semibold text-white mb-6">Top 10 States by Performance</h3>
                  <Bar data={statePerformanceData} options={chartOptions} />
                </div>
              )}
              
              {activeChart === 'sector' && (
                <div className="h-full">
                  <h3 className="text-2xl font-semibold text-white mb-6">Sector Investment Growth</h3>
                  <Line data={sectorGrowthData} options={chartOptions} />
                </div>
              )}
              
              {activeChart === 'fund' && (
                <div className="h-full flex items-center justify-around">
                  <div className="w-72 h-72">
                    <h3 className="text-2xl font-semibold text-white mb-6 text-center">Fund Type Distribution</h3>
                    <Doughnut 
                      data={fundTypeData} 
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            position: 'bottom',
                            labels: {
                              ...chartOptions.plugins.legend.labels,
                              padding: 20
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                  <div className="space-y-4 text-white/70">
                    <div>
                      <p className="text-lg font-medium text-white mb-3">Key Insights</p>
                      <ul className="space-y-2 text-sm font-light">
                        <li className="flex items-center gap-2">
                          <span className="text-[#30d158]">•</span>
                          National funds dominate with 54% share
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#30d158]">•</span>
                          Average fund size: $380M
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#30d158]">•</span>
                          13 new QOFs formed monthly
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-[#30d158]">•</span>
                          87% capital deployment rate
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}