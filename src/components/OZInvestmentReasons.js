'use client';

import ActionButtons from './ActionButtons';
import { HandHeart, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export default function OZInvestmentReasons() {
  const investmentReasons = [
    {
      id: 'social-impact',
      title: 'Meaningful Social Impact',
      icon: HandHeart,
      description: 'Create lasting positive change in America\'s most underserved communities',
      highlights: [
        <>Revitalize distressed communities nationwide</>,
        <>Create jobs in areas that need them most</>,
        <>Support affordable housing development</>,
        <>Build generational wealth for local residents</>
      ],
      gradient: 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      textColor: 'text-indigo-900 dark:text-indigo-300',
      accentColor: 'text-indigo-700 dark:text-indigo-400'
    },
    {
      id: 'tax-benefits',
      title: 'Exceptional Tax Benefits',
      icon: DollarSign,
      description: 'Defer and reduce capital gains taxes with significant long-term savings',
      highlights: [
        <>Defer capital gains taxes until <span className="text-black dark:text-white font-bold">2026</span></>,
        <>Reduce original gain by up to <span className="text-black dark:text-white font-bold">15%</span></>,
        <>Eliminate taxes on new OZ gains if held <span className="text-black dark:text-white font-bold">10+ years</span></>,
        <>No annual income limits or investment caps</>
      ],
      gradient: 'from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20',
      textColor: 'text-emerald-900 dark:text-emerald-300',
      accentColor: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      id: 'economic-development',
      title: 'Economic Catalyst',
      icon: TrendingUp,
      description: 'Be part of the largest economic development initiative in modern U.S. history',
      highlights: [
        <><span className="text-black dark:text-white font-bold">$110+ billion</span> already invested nationwide</>,
        <><span className="text-black dark:text-white font-bold">8,765</span> designated zones across all <span className="text-black dark:text-white font-bold">50 states</span></>,
        <>Bipartisan support ensuring program stability</>,
        <>First-mover advantage in emerging markets</>
      ],
      gradient: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20',
      textColor: 'text-orange-900 dark:text-orange-300',
      accentColor: 'text-orange-700 dark:text-orange-400'
    },
    {
      id: 'portfolio-diversification',
      title: 'Portfolio Diversification',
      icon: BarChart3,
      description: 'Access unique real estate and business opportunities with enhanced returns',
      highlights: [
        <>Invest in emerging markets with growth potential</>,
        <>Access institutional-quality deals</>,
        <>Diversify across geographies and sectors</>,
        <>Benefit from gentrification and appreciation</>
      ],
      gradient: 'from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
      textColor: 'text-purple-900 dark:text-purple-300',
      accentColor: 'text-purple-700 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Investment Reasons Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {investmentReasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <div 
                key={reason.id}
                className={`glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${reason.gradient} border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeIn flex flex-col`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3 sm:mb-4">
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${reason.textColor}`} />
                  </div>
                  <div className="h-20 sm:h-24 lg:h-28 xl:h-24 mb-2 sm:mb-3">
                    <h3 className={`text-2xl sm:text-3xl font-semibold ${reason.textColor}`}>
                      {reason.title}
                    </h3>
                  </div>
                  <div className="h-20 sm:h-24 lg:h-28 xl:h-24 mb-4 sm:mb-6">
                    <p className={`${reason.accentColor} text-base sm:text-lg font-light leading-relaxed`}>
                      {reason.description}
                    </p>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="space-y-2 sm:space-y-3 flex-1">
                  {reason.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3 min-h-[2.5rem] sm:min-h-[3rem]">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black dark:bg-white rounded-full mt-1.5 sm:mt-2 flex-shrink-0`} />
                      <div className={`${reason.accentColor} text-sm sm:text-base font-light leading-relaxed`}>
                        {highlight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="text-center px-4 sm:px-0">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
} 