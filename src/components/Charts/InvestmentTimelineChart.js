'use client';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { investmentTimelineData } from '@/data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement,
                Title, Tooltip, Legend, Filler);

export default function InvestmentTimelineChart() {
  return (
    <Line
      options={{
        responsive:true, maintainAspectRatio:false,
        scales:{ y:{ beginAtZero:true } }
      }}
      data={investmentTimelineData}
    />
  );
} 