'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { sectorAllocationData } from '@/data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SectorAllocationChart() {
  return (
    <Doughnut
      options={{ responsive:true, maintainAspectRatio:false }}
      data={sectorAllocationData}
    />
  );
} 