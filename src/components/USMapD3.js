'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getStateInvestmentAttractivenessScore, exampleStateHoverData } from '@/data/mockData';

export default function USMapD3() {
  const svgRef = useRef();
  const [statesGeo, setStatesGeo] = useState(null);
  const [zonesGeo, setZonesGeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/maps/us-states.json').then(r => r.json()),
      fetch('https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Opportunity_Zones/FeatureServer/13/query?outFields=*&where=1%3D1&f=geojson').then(r => r.json())
    ]).then(([statesData, zonesData]) => {
      setStatesGeo(statesData);
      setZonesGeo(zonesData);
      setLoading(false); // Hide loading once both datasets load
    });
  }, []);

  useEffect(() => {
    if (!statesGeo || !zonesGeo) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 500;

    const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeo);
    const path = d3.geoPath().projection(projection);

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto')
    
    // Draw state outlines (Layer 1)
    svg.append('g')
      .selectAll('path')
      .data(statesGeo.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#bbb')
      .attr('stroke-width', 1);
    
    // Draw opportunity zones (Layer 2)
    svg.append('g')
      .selectAll('path')
      .data(zonesGeo.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#466ABD') // Fill color for zones
      .attr('opacity', 0.5)
      .attr('stroke', '#364870')
      .attr('stroke-width', 0.5)
      .on('mouseover', function (event, d) {
        const score = getStateInvestmentAttractivenessScore(d.properties.STATE_NAME);
        const hoverData = exampleStateHoverData(d.properties.STATE_NAME);

        setTooltipContent(`
          <strong>${hoverData.StateName}</strong><br/>
          Capital: ${hoverData["Total Capital Deployed"]}<br/>
          QOFs: ${hoverData["Active QOFs"]}
        `);
        setShowTooltip(true);

        const [x, y] = d3.pointer(event);
        setTooltipPosition({ x, y });

        d3.select(this).attr('stroke-width', 2);
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event);
        setTooltipPosition({ x, y });
      })
      .on('mouseout', function () {
        setShowTooltip(false);
        d3.select(this).attr('stroke-width', 0.5);
      });
  }, [statesGeo, zonesGeo]);

  return (
    <section className="bg-white p-4 rounded-xl shadow-md relative overflow-visible">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">National Overview</h2>

      {loading ? (
        <div className = "text-center text-gray-600 py-8">
          Loading map...
        </div>
      ) : (
      <>
         <svg ref={svgRef} className="rounded-md" />
         {showTooltip && (
          <div
             className="absolute bg-gray-900 text-white text-sm p-2 rounded shadow-md pointer-events-none"
             style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10,
              maxWidth: '200px',
             }}
            dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
      </>
      )}
    </section>
  );
}
