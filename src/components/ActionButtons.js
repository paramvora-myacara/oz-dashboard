'use client';

export default function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 animate-fadeIn">
      <button
        className="border-2 border-white px-8 py-4 rounded-full text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        onMouseEnter={(e) => e.target.style.background = '#28b34f'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.02)'}
      >
        Check if your <i>Development</i> is in an OZ
      </button>
      <button
        className="border-2 border-white px-8 py-4 rounded-full text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        onMouseEnter={(e) => e.target.style.background = '#28b34f'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.02)'}
      >
        Check if you can <i>Invest</i> in an OZ
      </button>
    </div>
  );
} 