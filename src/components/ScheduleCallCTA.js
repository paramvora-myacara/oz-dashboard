'use client';

export default function ScheduleCallCTA({ className = '' }) {
  const scheduleRoute = process.env.NEXT_PUBLIC_SCHEDULE_ROUTE || 'schedule';
  const homepageUrl = process.env.NEXT_PUBLIC_HOMEPAGE_URL || '';
  const scheduleUrl = `${homepageUrl}/${scheduleRoute}`;

  return (
    <div className={`my-8 text-center ${className}`}>
      <a
        href={scheduleUrl}
        target="_self"
        className="inline-block bg-brand-secondary text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-brand-primary transition-colors duration-300"
      >
        Schedule a Call
      </a>
    </div>
  );
} 