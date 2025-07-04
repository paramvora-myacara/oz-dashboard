// src/components/SuccessStories.js
import { Factory, Building2, Home, Anchor, ArrowRight } from 'lucide-react';

export default function SuccessStories() {
    const stories = [
      {
        title: "Birmingham Tech Hub",
        location: "Birmingham, AL",
        investment: "$45M",
        impact: "1,200 jobs created",
        roi: "28% IRR",
        description: "Transformed abandoned warehouse district into thriving innovation center",
        iconBefore: Factory,
        iconAfter: Building2,
        tags: ["Tech", "Urban Renewal"]
      },
      {
        title: "Verde Affordable Housing",
        location: "Phoenix, AZ", 
        investment: "$32M",
        impact: "450 units built",
        roi: "22% IRR",
        description: "Created sustainable affordable housing with solar power and community gardens",
        iconBefore: Home,
        iconAfter: null,
        tags: ["Housing", "Sustainable"]
      },
      {
        title: "Coastal Manufacturing Revival",
        location: "Charleston, SC",
        investment: "$78M",
        impact: "2,100 jobs",
        roi: "31% IRR",
        description: "Revitalized former naval yard into advanced manufacturing facility",
        iconBefore: Anchor,
        iconAfter: Factory,
        tags: ["Manufacturing", "Jobs"]
      }
    ];
  
    const testimonials = [
      {
        quote: "The OZ program allowed us to create meaningful impact while delivering strong returns to our investors.",
        author: "Sarah Chen",
        role: "CEO, Impact Capital Partners",
        rating: 5
      },
      {
        quote: "We've seen entire communities transform through strategic OZ investments. It's been truly rewarding.",
        author: "Michael Rodriguez",
        role: "Managing Director, Urban Renewal Fund",
        rating: 5
      }
    ];
  
    return (
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Success Stories</h2>
          <p className="text-gray-600 dark:text-gray-300">Real impact, real returns, real communities transformed</p>
        </div>
  
        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story, idx) => {
            const IconBefore = story.iconBefore;
            const IconAfter = story.iconAfter;
            
            return (
              <div key={idx} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <IconBefore className="w-10 h-10" />
                    {IconAfter && (
                      <>
                        <ArrowRight className="w-6 h-6" />
                        <IconAfter className="w-10 h-10" />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {story.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{story.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{story.location}</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{story.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Investment</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{story.investment}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Impact</p>
                      <p className="font-semibold text-green-700 dark:text-green-300">{story.impact}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300">Return</p>
                      <p className="font-semibold text-blue-700 dark:text-blue-300">{story.roi}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Testimonials */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">What Investors Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Impact Metrics */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-8">Cumulative Impact Since 2018</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-bold">$105B+</p>
              <p className="text-blue-100">Total Investment</p>
            </div>
            <div>
              <p className="text-4xl font-bold">2.1M</p>
              <p className="text-blue-100">Jobs Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold">313K</p>
              <p className="text-blue-100">Housing Units</p>
            </div>
            <div>
              <p className="text-4xl font-bold">8,764</p>
              <p className="text-blue-100">Active Zones</p>
            </div>
          </div>
        </div>
      </section>
    );
  }