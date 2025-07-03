'use client';

import ActionButtons from './ActionButtons';

export default function OZInvestmentReasons() {
  const investmentReasons = [
    {
      id: 'tax-benefits',
      title: 'Exceptional Tax Benefits',
      icon: '💰',
      description: 'Defer and reduce capital gains taxes with significant long-term savings',
      highlights: [
        'Defer capital gains taxes until 2026',
        'Reduce original gain by up to 15%',
        'Eliminate taxes on new OZ gains if held 10+ years',
        'No annual income limits or investment caps'
      ],
      gradient: 'from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20',
      textColor: 'text-emerald-900 dark:text-emerald-300',
      accentColor: 'text-emerald-700 dark:text-emerald-400'
    },
    {
      id: 'social-impact',
      title: 'Meaningful Social Impact',
      icon: '🤝',
      description: 'Create lasting positive change in America\'s most underserved communities',
      highlights: [
        'Revitalize distressed communities nationwide',
        'Create jobs in areas that need them most',
        'Support affordable housing development',
        'Build generational wealth for local residents'
      ],
      gradient: 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      textColor: 'text-indigo-900 dark:text-indigo-300',
      accentColor: 'text-indigo-700 dark:text-indigo-400'
    },
    {
      id: 'portfolio-diversification',
      title: 'Superior Portfolio Diversification',
      icon: '📊',
      description: 'Access unique real estate and business opportunities with enhanced returns',
      highlights: [
        'Invest in emerging markets with growth potential',
        'Access institutional-quality deals',
        'Diversify across geographies and sectors',
        'Benefit from gentrification and appreciation'
      ],
      gradient: 'from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
      textColor: 'text-purple-900 dark:text-purple-300',
      accentColor: 'text-purple-700 dark:text-purple-400'
    },
    {
      id: 'economic-development',
      title: 'Economic Development Catalyst',
      icon: '🚀',
      description: 'Be part of the largest economic development initiative in modern U.S. history',
      highlights: [
        '$110+ billion already invested nationwide',
        '8,765 designated zones across all 50 states',
        'Bipartisan support ensuring program stability',
        'First-mover advantage in emerging markets'
      ],
      gradient: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20',
      textColor: 'text-orange-900 dark:text-orange-300',
      accentColor: 'text-orange-700 dark:text-orange-400'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black dark:text-white tracking-tight mb-3 sm:mb-4 lg:mb-6">
            Why Invest in Opportunity Zones?
          </h2>
          <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 font-light max-w-3xl mx-auto px-4 sm:px-0">
            Discover the compelling reasons why sophisticated investors are choosing Opportunity Zones 
            for tax advantages, social impact, and exceptional returns
          </p>
        </div>

        {/* Investment Reasons Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16 lg:mb-20">
          {investmentReasons.map((reason, index) => (
            <div 
              key={reason.id}
              className={`glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${reason.gradient} border border-black/10 dark:border-white/10 hover:scale-[1.02] transition-all duration-300 animate-fadeIn`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl">{reason.icon}</div>
                <div className="flex-1">
                  <h3 className={`text-xl sm:text-2xl font-semibold ${reason.textColor} mb-2 sm:mb-3`}>
                    {reason.title}
                  </h3>
                  <p className={`${reason.accentColor} text-sm sm:text-base font-light leading-relaxed`}>
                    {reason.description}
                  </p>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 sm:space-y-3">
                {reason.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-1.5 h-1.5 ${reason.textColor.replace('text-', 'bg-')} rounded-full mt-1.5 sm:mt-2 flex-shrink-0`} />
                    <p className={`${reason.accentColor} text-xs sm:text-sm font-light leading-relaxed`}>
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center px-4 sm:px-0">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
} 