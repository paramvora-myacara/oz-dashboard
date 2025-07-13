'use client';

import { useState } from 'react';

export default function TabContainer({ tabs, defaultTab = 0, className = '' }) {
  const [activeTabIndex, setActiveTabIndex] = useState(defaultTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="w-full mb-8 animate-fadeIn">
        <div className="glass-card rounded-3xl p-2 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 flex w-full">
          {tabs.map((tab, index) => (
            <button
              key={tab.id || index}
              onClick={() => setActiveTabIndex(index)}
              className={`flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                activeTabIndex === index
                  ? 'bg-[#0071e3] text-white shadow-lg'
                  : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {tabs[activeTabIndex] && tabs[activeTabIndex].content}
      </div>
    </div>
  );
} 