// src/components/InvestmentInsights.js

'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { BarChart3, Building2, MapPin } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

export default function InvestmentInsights() {
  const [activeTab, setActiveTab] = useState('performance');

  const performanceData = {
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
    datasets: [
      {
        label: 'OZ Investments',
        data: [65, 72, 78, 85, 92, 98, 105, 112],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Traditional RE',
        data: [62, 65, 69, 73, 76, 79, 82, 85],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const sectorData = {
    labels: ['Commercial Real Estate', 'Multifamily Housing', 'Small Business', 'Infrastructure', 'Mixed Use'],
    datasets: [{
      data: [38, 28, 18, 10, 6],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(217, 70, 239, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const regionData = {
    labels: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'],
    datasets: [{
      label: 'Investment Volume ($B)',
      data: [23.5, 31.2, 18.7, 15.3, 16.6],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8
    }]
  };

  const tabs = [
    { id: 'performance', label: 'Performance Trends', icon: BarChart3 },
    { id: 'sectors', label: 'Sector Allocation', icon: Building2 },
    { id: 'regions', label: 'Regional Distribution', icon: MapPin }
  ];

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8">
        <h2 className="text-3xl font-bold mb-2">Investment Analytics</h2>
        <p className="text-indigo-100">Deep dive into Opportunity Zone investment patterns and returns</p>
      </div>
      
      <div className="p-8">
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-96">
          {activeTab === 'performance' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">OZ vs Traditional RE Performance</h3>
              <Line 
                data={performanceData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      position: 'top',
                      labels: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(229, 231, 235)' 
                          : 'rgb(75, 85, 99)'
                      }
                    },
                    title: { display: false }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      }
                    },
                    y: {
                      beginAtZero: true,
                      title: { 
                        display: true, 
                        text: 'Index Value',
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      },
                      grid: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
          
          {activeTab === 'sectors' && (
            <div className="flex items-center justify-around h-full">
              <div className="w-80 h-80">
                <Doughnut 
                  data={sectorData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'right',
                        labels: {
                          color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                            ? 'rgb(229, 231, 235)' 
                            : 'rgb(75, 85, 99)'
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Key Insights</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Commercial RE dominates with 38% allocation
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Multifamily showing strongest growth trajectory
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Small business investments up 45% YoY
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'regions' && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Regional Investment Distribution</h3>
              <Bar 
                data={regionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      }
                    },
                    y: {
                      beginAtZero: true,
                      title: { 
                        display: true, 
                        text: 'Investment Volume ($B)',
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      },
                      grid: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)'
                      },
                      ticks: {
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                          ? 'rgb(156, 163, 175)' 
                          : 'rgb(75, 85, 99)'
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Average Deal Size</h4>
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">$24.5M</p>
            <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">+15% from last year</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Fund Formation Rate</h4>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">13/month</p>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">New QOFs created</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Capital Deployed</h4>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">87%</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">Of raised funds</p>
          </div>
        </div>
      </div>
    </section>
  );
}