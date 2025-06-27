// src/components/OZMapVisualization.js

// Enhanced OZMapVisualization.js with subtle animations

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function OZMapVisualization() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState({ states: null, ozs: null });

  // Resize handling (debounced to avoid rapid re-renders)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    // Debounce resize events to 150 ms
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };

    updateDimensions();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load data once
  useEffect(() => {
    Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()),
      fetch('https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Opportunity_Zones/FeatureServer/13/query?outFields=*&where=1%3D1&f=geojson').then(r => r.json())
    ]).then(([topoData, ozData]) => {
      setMapData({
        states: feature(topoData, topoData.objects.states),
        ozs: ozData
      });
      setLoading(false);
    }).catch(err => {
      console.error('Error loading map data:', err);
      setLoading(false);
    });
  }, []);

  // Throttled mouse tracking (max ~60 fps)
  const lastMoveRef = useRef(0);
  const handleMouseMove = useCallback((event) => {
    const now = performance.now();
    if (now - lastMoveRef.current < 16) return; // throttle to ~60 fps
    lastMoveRef.current = now;

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, []);

  // Memoized projection
  const projection = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return null;
    return d3.geoAlbersUsa()
      .scale(dimensions.width * 1.3)
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions.width, dimensions.height]);

  // After projection declaration, add memo to merge OZ path data per state
  const stateOZPaths = useMemo(() => {
    if (!mapData.ozs || !projection) return null;
    const pathGen = d3.geoPath().projection(projection);
    const acc = {};
    mapData.ozs.features.forEach(f => {
      const stateName = f.properties.STATE_NAME || f.properties.state || f.properties.name;
      if (!stateName) return;
      const dStr = pathGen(f);
      if (!dStr) return;
      acc[stateName] = (acc[stateName] || '') + dStr;
    });
    return acc;
  }, [mapData.ozs, projection]);

  // Check if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  // Render map
  useEffect(() => {
    if (!dimensions.width || !dimensions.height || !mapData.states || !projection || !stateOZPaths) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const path = d3.geoPath().projection(projection);

    // Beautiful gradient background
    const defs = svg.append('defs');
    
    // Radial gradient for background (different for light/dark mode)
    const bgGradient = defs.append('radialGradient')
      .attr('id', 'bg-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    if (isDarkMode) {
      bgGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#0a0a0a');
      
      bgGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#000000');
    } else {
      bgGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#f8f9fa');
      
      bgGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff');
    }

    // Glow filter for OZ zones
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Background
    svg.append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', 'url(#bg-gradient)');

    // Draw states with subtle styling (different for light/dark mode)
    const statesGroup = svg.append('g').attr('class', 'states-layer');
    
    statesGroup.selectAll('path')
      .data(mapData.states.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)')
      .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const name = d.properties.name;
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)')
          .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)');
        ozGroup.selectAll('path').attr('fill-opacity', 0.4);
        ozGroup.select(`path[data-state-name="${name}"]`) // names align via STATE_NAME
          .attr('fill-opacity', 0.7);
        setHoveredState(name);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)')
          .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)');
        ozGroup.selectAll('path').attr('fill-opacity', 0.4);
        setHoveredState(null);
      });

    // Draw OZ zones grouped by state (one path per state)
    const ozGroup = svg.append('g').attr('class', 'oz-layer');

    Object.entries(stateOZPaths).forEach(([stateName, dStr]) => {
      ozGroup.append('path')
        .attr('d', dStr)
        .attr('fill', '#30d158')
        .attr('fill-opacity', 0.4)
        .attr('stroke', 'none')
        .attr('filter', 'url(#glow)')
        .attr('data-state-name', stateName)
        .style('pointer-events', 'none');
      ozGroup.selectAll('path').attr('fill-opacity', 0.4);
    });
  }, [dimensions, mapData, projection, stateOZPaths, isDarkMode]);

  const getStateData = useCallback((stateName) => {
    const data = {
      'California': { zones: 879, investment: '$18.2B', growth: '+32%' },
      'Texas': { zones: 628, investment: '$14.5B', growth: '+28%' },
      'Florida': { zones: 427, investment: '$12.3B', growth: '+35%' },
      'New York': { zones: 514, investment: '$11.8B', growth: '+25%' },
      'Ohio': { zones: 320, investment: '$7.8B', growth: '+22%' },
      'Pennsylvania': { zones: 300, investment: '$6.5B', growth: '+20%' },
      'Illinois': { zones: 327, investment: '$8.1B', growth: '+24%' },
      'Michigan': { zones: 288, investment: '$5.9B', growth: '+19%' },
      'Georgia': { zones: 260, investment: '$9.2B', growth: '+30%' },
      'North Carolina': { zones: 252, investment: '$7.1B', growth: '+26%' }
    };
    return data[stateName] || { 
      zones: Math.floor(Math.random() * 200 + 50), 
      investment: `$${(Math.random() * 5 + 1).toFixed(1)}B`, 
      growth: `+${Math.floor(Math.random() * 20 + 10)}%` 
    };
  }, []);

  const stateData = hoveredState ? getStateData(hoveredState) : null;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-white dark:bg-black"
      onMouseMove={handleMouseMove}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />

      {/* Header with Apple-style typography */}
      <div className="absolute top-0 left-0 right-0 p-12 pointer-events-none text-center animate-fadeIn">
        <h1 className="text-6xl font-semibold text-black dark:text-white tracking-tight">State of the OZ</h1>
        <p className="text-xl text-black/70 dark:text-white/70 mt-3 font-light">
          8,764 zones • $105B+ invested • 2.1M jobs created
        </p>
      </div>

      {/* State Tooltip - Glassmorphism style */}
      {hoveredState && stateData && (
        <div 
          className="absolute glass-card rounded-2xl p-6 pointer-events-none z-50 animate-fadeIn bg-white/90 dark:bg-black/80 border border-black/10 dark:border-white/10"
          style={{
            left: `${Math.min(mousePosition.x + 20, dimensions.width - 280)}px`,
            top: `${Math.min(mousePosition.y + 20, dimensions.height - 180)}px`
          }}
        >
          <h3 className="text-2xl font-semibold text-black dark:text-white mb-3">{hoveredState}</h3>
          <div className="space-y-2">
            <div className="flex justify-between gap-12">
              <span className="text-black/60 dark:text-white/60">OZ Count</span>
              <span className="text-black dark:text-white font-medium">{stateData.zones}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60 dark:text-white/60">Investment</span>
              <span className="text-[#30d158] font-medium">{stateData.investment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60 dark:text-white/60">YoY Growth</span>
              <span className="text-[#0071e3] font-medium">{stateData.growth}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend - Minimalist style */}
      <div className="absolute bottom-8 left-8 glass-card rounded-xl px-4 py-3 animate-fadeIn bg-white/90 dark:bg-black/80 border border-black/10 dark:border-white/10">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black/10 dark:bg-white/10 rounded-full"></div>
            <span className="text-black/60 dark:text-white/60 font-light">States</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#30d158] rounded-full animate-pulse-subtle"></div>
            <span className="text-black/60 dark:text-white/60 font-light">Opportunity Zones</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-black/60 dark:text-white/60 font-light">Loading opportunity zones...</p>
          </div>
        </div>
      )}
    </div>
  );
}