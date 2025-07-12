'use client';

export default function SourcesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const sources = [
    {
      category: "Government Sources",
      items: [
        {
          title: "U.S. Department of Treasury - Opportunity Zones Working Paper",
          url: "https://home.treasury.gov/system/files/131/WP-123.pdf",
          description: "Official Treasury analysis of Opportunity Zone program"
        },
        {
          title: "U.S. Department of Housing and Urban Development - Opportunity Zones",
          url: "https://www.hud.gov/opportunity-zones/resources/map",
          description: "HUD's official OZ resources and mapping tools"
        },
        {
          title: "HUD Opportunity Zones Homepage",
          url: "http://www.hud.gov/opportunity-zones",
          description: "Primary government portal for OZ information"
        },
        {
          title: "U.S. Census Bureau - Opportunity Zone Analysis",
          url: "https://www2.census.gov/ces/wp/2021/CES-WP-21-12.pdf",
          description: "Census Bureau working paper on OZ economic impacts"
        },
        {
          title: "IRS - Opportunity Zones FAQ",
          url: "https://www.irs.gov/credits-deductions/opportunity-zones-frequently-asked-questions",
          description: "Internal Revenue Service official guidance"
        },
        {
          title: "IRS - Opportunity Zones for Businesses",
          url: "https://www.irs.gov/credits-deductions/businesses/opportunity-zones",
          description: "IRS business guidance for OZ investments"
        },
        {
          title: "Census Opportunity Portal",
          url: "https://opportunity.census.gov",
          description: "Official Census Bureau OZ data portal"
        },
        {
          title: "HUD GIS Open Data - Opportunity Zones",
          url: "https://hudgis-hud.opendata.arcgis.com/datasets/ef143299845841f8abb95969c01f88b5_13/about",
          description: "HUD's geographic information system data"
        },
        {
          title: "Treasury Press Release - OZ Designations",
          url: "https://home.treasury.gov/news/press-releases/sm864",
          description: "Official announcement of OZ designations"
        }
      ]
    },
    {
      category: "Industry Analysis & Research",
      items: [
        {
          title: "Novogradac - Opportunity Zones Resource Center",
          url: "https://www.novoco.com/resource-centers/opportunity-zones-resource-center/state-information",
          description: "Comprehensive state-by-state OZ information"
        },
        {
          title: "Novogradac Mapping Tool",
          url: "https://www.novoco.com/resource-centers/opportunity-zones-resource-center/novogradac-opportunity-zones-mapping-tool",
          description: "Interactive OZ mapping and analysis tool"
        },
        {
          title: "Stats America - Opportunity Zone Data",
          url: "https://www.statsamerica.org/opportunity/",
          description: "Statistical analysis of OZ performance"
        },
        {
          title: "Joint Committee on Taxation - OZ Report 2024",
          url: "https://www.jct.gov/publications/2024/opportunity-zones-tax-provisions-report-may-2024/",
          description: "Congressional tax analysis of OZ provisions"
        },
        {
          title: "Economic Innovation Group - OZ Brief 2023",
          url: "https://eig.org/opportunity-zones-brief-2023/",
          description: "Research organization's comprehensive OZ analysis"
        },
        {
          title: "EIG - OZ Investment Factsheet",
          url: "https://eig.org/wp-content/uploads/2021/10/OZ-Investments-Factsheet.pdf",
          description: "Key facts and figures on OZ investments"
        },
        {
          title: "Urban Institute - OZ Analysis",
          url: "https://www.urban.org/urban-wire/opportunity-zones-need-be-retooled-achieve-impact",
          description: "Policy research on OZ effectiveness"
        },
        {
          title: "Urban Institute - What We Know About OZs",
          url: "https://www.urban.org/urban-wire/what-we-do-and-dont-know-about-opportunity-zones",
          description: "Research findings on OZ program outcomes"
        }
      ]
    },
    {
      category: "Professional Services & Industry Reports",
      items: [
        {
          title: "Opportunity Zones Location Database",
          url: "https://opportunityzones.com/location/",
          description: "Comprehensive database of OZ locations"
        },
        {
          title: "Opportunity Zones 2024 Update",
          url: "https://opportunityzones.com/2024/01/2024-opportunity-zones-292/",
          description: "Industry update on OZ developments"
        },
        {
          title: "Opportunity Zones Funds Directory",
          url: "https://opportunityzones.com/funds/",
          description: "Directory of qualified opportunity funds"
        },
        {
          title: "Caliber - OZ Update Fall 2024",
          url: "https://www.caliberco.com/opportunity-zone-update-fall-2024/",
          description: "Investment firm's market analysis"
        },
        {
          title: "Multi-Housing News - OZ Progress 2024",
          url: "https://www.multihousingnews.com/how-opportunity-zones-progressed-through-2024/",
          description: "Real estate industry perspective on OZ development"
        },
        {
          title: "Baker Tilly - OZ Mapping Tool",
          url: "https://connect.bakertilly.com/opportunity-zones-mapping-tool",
          description: "Professional services firm's mapping tool"
        },
        {
          title: "KPMG - Opportunity Zones Analysis",
          url: "https://assets.kpmg.com/content/dam/kpmg/us/pdf/2019/09/opportunity-zones.pdf",
          description: "Professional services analysis of OZ program"
        }
      ]
    },
    {
      category: "State & Local Resources",
      items: [
        {
          title: "California Department of Finance - OZ Information",
          url: "https://dof.ca.gov/forecasting/demographics/california-opportunity-zones/",
          description: "California's official OZ resources"
        },
        {
          title: "National Council of State Housing Agencies",
          url: "https://www.ncsha.org/advocacy-issues/opportunity-zones/",
          description: "State housing agency OZ advocacy"
        },
        {
          title: "Community Progress - OZ Land Banks Map",
          url: "https://communityprogress.org/data-stories/opportunity-zones-land-banks-map/",
          description: "Community development perspective on OZ implementation"
        },
        {
          title: "Mission Investors Network - OZ Community Selection",
          url: "https://missioninvestors.org/resources/opportunity-zones-how-communities-were-selected-participation",
          description: "Analysis of community selection process"
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative glass-card rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden bg-white/90 dark:bg-black/80 backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/30 dark:to-blue-900/30">
          <div>
            <h2 className="text-2xl font-semibold text-black dark:text-white tracking-tight">Data Sources</h2>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1 font-light">
              Comprehensive sources for Modern KPI Dashboard data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300"
          >
            <svg 
              className="w-6 h-6 text-black/60 dark:text-white/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="space-y-8">
            {sources.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2 tracking-tight">
                  {category.category}
                </h3>
                <div className="grid gap-4">
                  {category.items.map((source, sourceIndex) => (
                    <div 
                      key={sourceIndex}
                      className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 hover:scale-[1.01] transition-all duration-300 bg-white/60 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-black dark:text-white mb-1 leading-tight">
                            {source.title}
                          </h4>
                          <p className="text-sm text-black/70 dark:text-white/70 mb-3 font-light leading-relaxed">
                            {source.description}
                          </p>
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[#0071e3] dark:text-[#0071e3] hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium"
                          >
                            <span className="break-all">{source.url}</span>
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
            <div className="glass-card rounded-2xl p-6 border border-indigo-200/60 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-900/30 dark:to-blue-900/30">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3 tracking-tight">Dataset Information</h4>
              <p className="text-sm text-indigo-800/90 dark:text-indigo-200/90 font-light leading-relaxed">
                This dataset encompasses <strong className="font-semibold">8,764 total Opportunity Zones</strong> across 56 jurisdictions, 
                representing the complete universe of designated OZ tracts in the United States. Investment estimates 
                are based on Treasury Department analysis through 2020 and industry tracking suggesting approximately 
                <strong className="font-semibold"> $100+ billion</strong> in total investment through 2024.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 