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
      accentColor: 'text-indigo-800 dark:text-indigo-400',
      bulletColor: 'text-indigo-700 dark:text-indigo-500'
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
      accentColor: 'text-emerald-800 dark:text-emerald-400',
      bulletColor: 'text-emerald-700 dark:text-emerald-500'
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
      accentColor: 'text-orange-800 dark:text-orange-400',
      bulletColor: 'text-orange-700 dark:text-orange-500'
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
      accentColor: 'text-purple-800 dark:text-purple-400',
      bulletColor: 'text-purple-700 dark:text-purple-500'
    }
  ];

  return (
    <div className="min-h-full bg-white dark:bg-black px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-8 pb-32 md:pb-8">
      {/* H1 Heading */}
      <div className="flex-shrink-0 mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-semibold text-black dark:text-white text-center tracking-tight animate-fadeIn">
          Why OZs?
        </h1>
      </div>

      {/* Investment Reasons Cards */}
      <div className="max-w-7xl mx-auto w-full mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-4 xl:gap-6">
          {investmentReasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <div 
                key={reason.id}
                className={`glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-4 xl:p-6 bg-gradient-to-br ${reason.gradient} border border-black/10 dark:border-white/20 hover:scale-[1.02] transition-all duration-300 animate-fadeIn flex flex-col h-full`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card Header */}
                <div className="mb-3 sm:mb-5 flex-shrink-0">
                  <div className="mb-2 sm:mb-3">
                    <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-6 lg:h-6 xl:w-8 xl:h-8 ${reason.textColor}`} />
                  </div>
                  <div className="min-h-[3rem] sm:min-h-[5rem] lg:min-h-[4rem] xl:min-h-[5rem] mb-0.5 sm:mb-1 flex items-start">
                    <h3 className={`text-2xl sm:text-2xl lg:text-xl xl:text-2xl font-semibold ${reason.textColor} leading-tight`}>
                      {reason.title}
                    </h3>
                  </div>
                  <div className="min-h-[3rem] sm:min-h-[6rem] lg:min-h-[5rem] xl:min-h-[6rem] mb-1 sm:mb-2 flex items-start">
                    <p className={`${reason.accentColor} text-xl sm:text-2xl lg:text-lg xl:text-xl font-light leading-relaxed`}>
                      {reason.description}
                    </p>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="space-y-1 sm:space-y-2 lg:space-y-3 xl:space-y-4 flex-1 pb-2 sm:pb-3">
                  {reason.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-1 sm:gap-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black dark:bg-white rounded-full mt-2 sm:mt-2 flex-shrink-0`} />
                      <div className={`${reason.bulletColor} text-base sm:text-lg lg:text-sm xl:text-base font-light leading-relaxed flex-1`}>
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

      {/* Action Buttons */}
      <div className="flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
} 