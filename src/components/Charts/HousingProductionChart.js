'use client';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { housingProductionData, ozPerformanceVsNonOz } from '@/data/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function HousingProductionChart() {
  return (
    <Bar options={{ responsive:true, maintainAspectRatio:false }} data={housingProductionData}/>
  );
}

export function PerformanceComparisonChart() {
  return (
    <Bar
      options={{ indexAxis:'y', responsive:true, maintainAspectRatio:false }}
      data={ozPerformanceVsNonOz}
    />
  );
} 