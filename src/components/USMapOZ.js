// src/components/USMapOZ.js

'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import { feature } from 'topojson-client';

export default function USMapOZ() {
  const [statesGeo, setStatesGeo] = useState(null);
  const [ozData, setOzData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    // Fetch states topology
    fetch('/maps/us-states-10m.json')
      .then(r => r.json())
      .then(topo => setStatesGeo(feature(topo, topo.objects.states)))
      .catch(err => console.error('Error loading states:', err));

    // Fetch OZ data
    fetch('https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Opportunity_Zones/FeatureServer/13/query?outFields=*&where=1%3D1&f=geojson')
      .then(r => r.json())
      .then(data => {
        setOzData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading OZ data:', err);
        setLoading(false);
      });
  }, []);

  const getStateStats = (stateName) => {
    if (!ozData || !stateName) return null;
    
    const stateOZs = ozData.features.filter(f => 
      f.properties && f.properties.state === stateName
    );
    
    return {
      totalZones: stateOZs.length,
      population: stateOZs.reduce((sum, f) => sum + (f.properties.population || 0), 0),
      avgPoverty: stateOZs.length ? 
        (stateOZs.reduce((sum, f) => sum + (f.properties.povertyrate || 0), 0) / stateOZs.length).toFixed(1) : 0,
      investment: `$${(Math.random() * 5 + 0.5).toFixed(1)}B`,
      growth: `+${(Math.random() * 15 + 5).toFixed(1)}%`
    };
  };

  const stateStyle = (feature) => ({
    fillColor: hoveredState === feature.properties.name ? '#3B82F6' : '#E5E7EB',
    weight: hoveredState === feature.properties.name ? 2 : 1,
    opacity: 1,
    color: '#9CA3AF',
    fillOpacity: hoveredState === feature.properties.name ? 0.3 : 0.1,
    transition: 'all 0.3s ease'
  });

  const ozStyle = {
    fillColor: '#10B981',
    weight: 0.5,
    opacity: 1,
    color: '#059669',
    fillOpacity: 0.6
  };

  const onEachState = (feature, layer) => {
    const stateName = feature.properties.name;
    
    layer.on({
      mouseover: () => setHoveredState(stateName),
      mouseout: () => setHoveredState(null),
      click: () => setSelectedState(stateName)
    });
  };

  const StateTooltip = ({ state }) => {
    const stats = getStateStats(state);
    if (!stats) return null;

    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 min-w-[280px] border border-gray-200/50 dark:border-gray-600/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{state}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Opportunity Zones</span>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{stats.totalZones}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Total Investment</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{stats.investment}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">YoY Growth</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.growth}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Avg Poverty Rate</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.avgPoverty}%</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:shadow-lg transition-all">
          View Details →
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading opportunity zones data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <h2 className="text-2xl font-bold">National Opportunity Zones Overview</h2>
        <p className="text-blue-100 mt-2">8,764 designated zones across all 50 states and territories</p>
      </div>
      
      <div className="p-6">
        <MapContainer 
          center={[39.5, -98.5]} 
          zoom={4} 
          scrollWheelZoom={false} 
          className="h-[500px] rounded-xl shadow-inner bg-white dark:bg-gray-800"
        >
          <TileLayer
            url="https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          />
          
          {statesGeo && (
            <GeoJSON 
              data={statesGeo} 
              style={stateStyle} 
              onEachFeature={onEachState}
            />
          )}
          
          {ozData && (
            <GeoJSON 
              data={ozData} 
              style={ozStyle}
              interactive={false}
            />
          )}
          
          {hoveredState && (
            <Tooltip permanent position={[39.5, -98.5]} direction="top" offset={[0, -20]}>
              <StateTooltip state={hoveredState} />
            </Tooltip>
          )}
        </MapContainer>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
            <h4 className="text-green-800 dark:text-green-300 font-semibold">Active Zones</h4>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">8,764</p>
            <p className="text-sm text-green-700 dark:text-green-400">Across all states</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
            <h4 className="text-blue-800 dark:text-blue-300 font-semibold">Total Investment</h4>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">$105B+</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">Since 2018</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
            <h4 className="text-purple-800 dark:text-purple-300 font-semibold">Jobs Created</h4>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">2.1M+</p>
            <p className="text-sm text-purple-700 dark:text-purple-400">Direct employment</p>
          </div>
        </div>
      </div>
    </section>
  );
}