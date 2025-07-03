'use client';

export default function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 animate-fadeIn">
      <button
        className="border-2 border-black dark:border-white px-8 py-4 rounded-full text-black dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-black/40 dark:focus:ring-white/40 transition-all backdrop-blur-md bg-white/80 dark:bg-white/5 hover:bg-[#28b34f] dark:hover:bg-[#28b34f] hover:border-[#28b34f] dark:hover:border-[#28b34f] hover:text-white dark:hover:text-white"
      >
        Check if your <i>Development</i> is in an OZ
      </button>
      <button
        className="border-2 border-black dark:border-white px-8 py-4 rounded-full text-black dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-black/40 dark:focus:ring-white/40 transition-all backdrop-blur-md bg-white/80 dark:bg-white/5 hover:bg-[#28b34f] dark:hover:bg-[#28b34f] hover:border-[#28b34f] dark:hover:border-[#28b34f] hover:text-white dark:hover:text-white"
      >
        Check if you can <i>Invest</i> in an OZ
      </button>
      <button
        className="border-2 border-black dark:border-white px-8 py-4 rounded-full text-black dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-black/40 dark:focus:ring-white/40 transition-all backdrop-blur-md bg-white/80 dark:bg-white/5 hover:bg-[#28b34f] dark:hover:bg-[#28b34f] hover:border-[#28b34f] dark:hover:border-[#28b34f] hover:text-white dark:hover:text-white"
      >
        Check how much <i>Tax</i> you can save
      </button>
    </div>
  );
} 