// src/components/OZMapVisualization.js

// Optimized OZMapVisualization.js for slide deck usage

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';


export default function OZMapVisualization({ onNavigate }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState({ states: null, ozs: null });
  const [ozData, setOzData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      // Use local copy to avoid external CDN failures (mobile offline etc.)
      fetch('/maps/us-states-10m.json').then(r => r.json()),
      fetch('/data/opportunity-zones-compressed.geojson').then(r => r.json()),
      fetch('/data/us-opportunity-zones-data.json').then(r => r.json())
    ]).then(([topoData, ozData, ozJsonData]) => {
      // Convert JSON data to a lookup object keyed by state name
      const dataLookup = {};
      Object.entries(ozJsonData.states_and_territories).forEach(([stateName, stateData]) => {
        dataLookup[stateName] = {
          category: stateData.category,
          totalOZSpaces: stateData.total_oz_spaces,
          activeProjects: stateData.active_projects_estimate,
          investmentVolume: stateData.investment_volume_estimate,
          investmentBillions: (stateData.investment_volume_estimate / 1000000000).toFixed(2),
          activeProjectRate: stateData.active_project_rate
        };
      });
      
      setMapData({
        states: feature(topoData, topoData.objects.states),
        ozs: ozData
      });
      setOzData({ data: dataLookup, metadata: ozJsonData.metadata });
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

  // Memoized projection - adjusted for 70% height map container
  const projection = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return null;
    // Calculate scale based on both width and height to maximize map size
    const scale = Math.min(dimensions.width * 1.4, dimensions.height * 2.0);
    return d3.geoAlbersUsa()
      .scale(scale) // Maximized scale for optimal visibility
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions.width, dimensions.height]);

  // Create paths for optimized state-grouped OZ data
  const stateOZPaths = useMemo(() => {
    if (!mapData.ozs || !projection) return null;
    const pathGen = d3.geoPath().projection(projection);
    const acc = {};
    mapData.ozs.features.forEach(f => {
      const stateName = f.properties.state; // optimized file uses 'state' property
      if (!stateName) return;
      const dStr = pathGen(f);
      if (!dStr) return;
      acc[stateName] = dStr; // no need to concatenate, already combined
    });
    return acc;
  }, [mapData.ozs, projection]);

  // Reactive theme detection
  useEffect(() => {
    setMounted(true);
    
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();

    // Create observer to watch for theme changes
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Render map
  useEffect(() => {
    if (!mounted || !dimensions.width || !dimensions.height || !mapData.states || !projection || !stateOZPaths) return;

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
        .attr('stop-color', '#ffffff');
      
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
      .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'transparent')
      .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const name = d.properties.name;
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.02)')
          .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)');
        ozGroup.selectAll('path').attr('fill-opacity', 0.4);
        ozGroup.select(`path[data-state-name="${name}"]`) // names align via STATE_NAME
          .attr('fill-opacity', 0.7);
        setHoveredState(name);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'transparent')
          .attr('stroke', isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)');
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
    });
  }, [dimensions, mapData, projection, stateOZPaths, isDarkMode, mounted]);

  const getStateData = useCallback((stateName) => {
    if (!ozData || !ozData.data || !ozData.data[stateName]) {
      return null;
    }
    
    const stateRow = ozData.data[stateName];
    
    return {
      zones: stateRow.totalOZSpaces,
      activeProjects: stateRow.activeProjects,
      investmentBillions: stateRow.investmentBillions,
      activeProjectRate: stateRow.activeProjectRate,
      category: stateRow.category
    };
  }, [ozData]);

  const stateData = hoveredState ? getStateData(hoveredState) : null;

  return (
    <div className="w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-start md:justify-center pt-4 md:pt-0 pb-24 md:pb-0 bg-white dark:bg-black relative">
      {/* Header Section - 20% of height */}
      <div className="w-full flex flex-col justify-center items-center text-center animate-fadeIn px-12 sm:py-8 mt-6 md:mt-0">
        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-semibold text-black dark:text-white tracking-tight">State of the OZ</h1>
        <p className="text-xl text-black/70 dark:text-white/70 mt-3 font-light">
          {ozData && ozData.metadata ? (
            <>
              {/* Desktop inline summary */}
              <span className="hidden md:inline">
                {ozData.metadata.total_oz_spaces.toLocaleString()} zones • ${ (ozData.metadata.total_investment_volume_estimate / 1000000000).toFixed(0) }B+ invested • {ozData.metadata.total_active_projects_estimate.toLocaleString()} active projects
              </span>
              {/* Mobile stacked summary */}
              <span className="md:hidden">
                • {ozData.metadata.total_active_projects_estimate.toLocaleString()} active projects<br />
                • {ozData.metadata.total_oz_spaces.toLocaleString()} zones<br />
                • ${ (ozData.metadata.total_investment_volume_estimate / 1000000000).toFixed(0) }B+ invested
              </span>
            </>
          ) : (
            <>
              {/* Desktop inline fallback */}
              <span className="hidden md:inline">8,765 zones • $100B+ invested • 6,284 active projects</span>
              {/* Mobile stacked fallback */}
              <span className="md:hidden">
                • 6,284 active projects<br />
                • 8,765 zones<br />
                • $100B+ invested
              </span>
            </>
          )}
        </p>
      </div>

      {/* Map Section */}
      <div className="flex flex-col items-center justify-start w-full mt-12 md:mt-2">
        <div 
          ref={containerRef} 
          className="relative w-full aspect-[16/9] max-h-[75vh] bg-white dark:bg-black"
          onMouseMove={handleMouseMove}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0"
          />

          {/* State Tooltip - Glassmorphism style */}
          {hoveredState && stateData && (
            <div 
              className="absolute glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-7 xl:p-8 pointer-events-none z-50 animate-fadeIn bg-white/90 dark:bg-black/80 border border-black/10 dark:border-white/10"
              style={{
                left: `${Math.min(mousePosition.x + 15, dimensions.width - (dimensions.width < 640 ? 220 : dimensions.width < 1024 ? 280 : 320))}px`,
                top: `${Math.min(mousePosition.y + 15, dimensions.height - (dimensions.width < 640 ? 140 : dimensions.width < 1024 ? 180 : 200))}px`
              }}
            >
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-black dark:text-white mb-2 sm:mb-3 lg:mb-4">{hoveredState}</h3>
              <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                <div className="flex justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
                  <span className="text-xs sm:text-sm lg:text-base text-black/60 dark:text-white/60">OZ Zones</span>
                  <span className="text-xs sm:text-sm lg:text-base text-black dark:text-white font-medium">{stateData.zones}</span>
                </div>
                <div className="flex justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
                  <span className="text-xs sm:text-sm lg:text-base text-black/60 dark:text-white/60">Active Projects</span>
                  <span className="text-xs sm:text-sm lg:text-base text-[#0071e3] font-medium">{stateData.activeProjects}</span>
                </div>
                <div className="flex justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
                  <span className="text-xs sm:text-sm lg:text-base text-black/60 dark:text-white/60">Investment Volume</span>
                  <span className="text-xs sm:text-sm lg:text-base text-[#30d158] font-medium">${stateData.investmentBillions}B</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-black/60 dark:border-t-white/60 rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-black/60 dark:text-white/60 font-light">Loading opportunity zones...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instruction Box Below Map */}
      <div className="my-3 mb-28 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/80 text-sm font-medium inline-block shadow-sm md:hidden">
        Tap a state to see its details
      </div>

      {/* Bottom-right scroll button */}
      <div className="fixed bottom-20 md:bottom-8 right-8 md:right-[calc(35%+2rem)] lg:right-[calc(30%+2rem)] xl:right-[calc(25%+2rem)] z-50">
        <div 
          className="bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-black/60 dark:text-white/60 flex items-center gap-2 cursor-pointer hover:bg-black/20 dark:hover:bg-white/20 transition-all duration-300"
          onClick={() => onNavigate && onNavigate(1)}
        >
          <span>Scroll down for investment reasons</span>
          <svg 
            className="w-4 h-4 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ animationDuration: '1.5s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}