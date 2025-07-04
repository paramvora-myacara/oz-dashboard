'use client';

import ActionButtons from './ActionButtons';
import { HandHeart, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export default function OZInvestmentReasons() {
  const investmentReasons = [
    {
      id: 'social-impact',
      title: 'Social Impact',
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
      description: 'Join the largest economic development initiative in U.S. history',
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
      description: 'Access exclusive real estate & business deals with higher returns',
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
    <div className="h-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 flex flex-col">
      {/* H1 Heading - 15% */}
      <div className="h-[15%] flex items-center justify-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-black dark:text-white text-center tracking-tight animate-fadeIn">
          Why OZs?
        </h1>
      </div>

      {/* Investment Reasons Cards - 55% (increased from 50%) */}
      <div className="h-[55%] max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-4 xl:gap-6 h-full">
          {investmentReasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <div 
                key={reason.id}
                className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-4 xl:p-6 bg-gradient-to-br ${reason.gradient} border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeIn flex flex-col h-full`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Header */}
                <div className="mb-4 sm:mb-6 flex-shrink-0">
                  <div className="mb-3 sm:mb-4">
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 ${reason.textColor}`} />
                  </div>
                  <div className="h-16 sm:h-20 lg:h-16 xl:h-20 mb-3 sm:mb-4 flex items-start">
                    <h3 className={`text-xl sm:text-2xl lg:text-xl xl:text-2xl font-semibold ${reason.textColor} leading-tight`}>
                      {reason.title}
                    </h3>
                  </div>
                  <div className="h-20 sm:h-24 lg:h-20 xl:h-24 mb-2 sm:mb-3 flex items-start">
                    <p className={`${reason.accentColor} text-lg sm:text-xl lg:text-lg xl:text-xl font-light leading-relaxed`}>
                      {reason.description}
                    </p>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="space-y-4 sm:space-y-5 lg:space-y-4 xl:space-y-5 flex-1">
                  {reason.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4 min-h-[3rem] sm:min-h-[3.5rem] lg:min-h-[3rem] xl:min-h-[3.5rem]">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black dark:bg-white rounded-full mt-2 sm:mt-2.5 flex-shrink-0`} />
                      <div className={`${reason.accentColor} text-sm sm:text-base lg:text-sm xl:text-base font-light leading-relaxed flex-1`}>
                        {highlight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap - 7% */}
      <div className="h-[7%]"></div>

      {/* Action Buttons - 15% */}
      <div className="h-[15%] flex items-center justify-center">
        <div className="max-w-7xl w-full">
          <ActionButtons />
        </div>
      </div>

      {/* Bottom spacer - 8% (increased from 5%) */}
      <div className="h-[8%]"></div>
    </div>
  );
} 