// src/components/OZMapVisualization.js

'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function OZMapVisualization() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredState, setHoveredState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create gradients and filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background gradient
    const bgGradient = defs.append('radialGradient')
      .attr('id', 'bg-gradient');
    
    bgGradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#1a1a2e;stop-opacity:1');
    
    bgGradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#0f0f1e;stop-opacity:1');

    // Background
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', 'url(#bg-gradient)');

    const projection = d3.geoAlbersUsa()
      .scale(dimensions.width * 1.3)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load data
    Promise.all([
      fetch('/maps/us-states-10m.json').then(r => r.json()),
      fetch('/data/opportunity-zones.geojson').then(r => r.json())
    ]).then(([topoData, ozData]) => {
      const states = feature(topoData, topoData.objects.states);

      // Draw states
      const statesGroup = svg.append('g').attr('class', 'states');
      
      statesGroup.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#1e293b')
        .attr('stroke', '#334155')
        .attr('stroke-width', 0.5)
        .attr('class', 'state')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', '#334155')
            .attr('stroke', '#64748b')
            .attr('stroke-width', 1);
          setHoveredState(d.properties.name);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', '#1e293b')
            .attr('stroke', '#334155')
            .attr('stroke-width', 0.5);
          setHoveredState(null);
        });

      // Draw OZ zones with glow effect
      const ozGroup = svg.append('g').attr('class', 'oz-zones');
      
      ozGroup.selectAll('path')
        .data(ozData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#10b981')
        .attr('fill-opacity', 0.6)
        .attr('stroke', '#34d399')
        .attr('stroke-width', 0.3)
        .attr('filter', 'url(#glow)')
        .attr('class', 'oz-zone');

      // Animated particles
      const particlesGroup = svg.append('g').attr('class', 'particles');
      
      const createParticle = () => {
        const x = Math.random() * dimensions.width;
        const y = Math.random() * dimensions.height;
        
        particlesGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 0)
          .attr('fill', '#60a5fa')
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('r', Math.random() * 3 + 1)
          .attr('opacity', 0.8)
          .transition()
          .duration(3000)
          .attr('cy', y - 100)
          .attr('opacity', 0)
          .remove();
      };

      // Create particles periodically
      setInterval(createParticle, 200);

      setLoading(false);
    });
  }, [dimensions]);

  const getStateData = (stateName) => {
    // Mock data - replace with real data
    const data = {
      'California': { zones: 879, investment: '$18.2B', growth: '+32%' },
      'Texas': { zones: 628, investment: '$14.5B', growth: '+28%' },
      'Florida': { zones: 427, investment: '$12.3B', growth: '+35%' },
      'New York': { zones: 514, investment: '$11.8B', growth: '+25%' },
      // Add more states...
    };
    return data[stateName] || { zones: Math.floor(Math.random() * 200 + 50), investment: `$${(Math.random() * 5 + 1).toFixed(1)}B`, growth: `+${Math.floor(Math.random() * 20 + 10)}%` };
  };

  const stateData = hoveredState ? getStateData(hoveredState) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 pointer-events-none">
        <h1 className="text-5xl font-bold text-white text-center">
          Opportunity Zones Market Intelligence
        </h1>
        <p className="text-xl text-gray-400 text-center mt-2">
          8,764 zones • $105B+ invested • 2.1M jobs created
        </p>
      </div>

      {/* State Info Card */}
      {hoveredState && stateData && (
        <div className="absolute top-32 left-8 bg-black/80 backdrop-blur-xl border border-gray-700 rounded-xl p-6 pointer-events-none animate-fadeIn">
          <h3 className="text-2xl font-bold text-white mb-4">{hoveredState}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">OZ Count</span>
              <span className="text-white font-semibold">{stateData.zones}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Investment</span>
              <span className="text-green-400 font-semibold">{stateData.investment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">YoY Growth</span>
              <span className="text-blue-400 font-semibold">{stateData.growth}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-xl border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <span className="text-sm text-gray-300">States</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <span className="text-sm text-gray-300">Opportunity Zones</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading visualization...</p>
          </div>
        </div>
      )}
    </div>
  );
}