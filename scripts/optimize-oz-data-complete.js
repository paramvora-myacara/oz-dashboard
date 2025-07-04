#!/usr/bin/env node

// Complete OZ data optimization pipeline - fetch, optimize, and compress in one go
// Run with: node scripts/optimize-oz-data-complete.js [options]

const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  debug: args.includes('--debug'),
  skipFetch: args.includes('--skip-fetch'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
*** Complete OZ Data Optimization Pipeline ***

Usage: node scripts/optimize-oz-data-complete.js [options]

Options:
  --debug        Save intermediate optimized file for debugging
  --skip-fetch   Use existing intermediate file instead of fetching
  --help, -h     Show this help message

Examples:
  node scripts/optimize-oz-data-complete.js              # Full pipeline
  node scripts/optimize-oz-data-complete.js --debug      # Save intermediate file
  node scripts/optimize-oz-data-complete.js --skip-fetch # Use existing data
`);
  process.exit(0);
}

// Utility to make HTTP requests
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Basic coordinate precision reduction
function reduceCoordinatePrecision(coordinates, precision = 4) {
  if (Array.isArray(coordinates[0])) {
    return coordinates.map(coord => reduceCoordinatePrecision(coord, precision));
  }
  return coordinates.map(coord => parseFloat(coord.toFixed(precision)));
}

// Aggressive coordinate precision reduction
function reduceCoordinatePrecisionAggressive(coordinates, precision = 3) {
  if (Array.isArray(coordinates[0])) {
    return coordinates.map(coord => reduceCoordinatePrecisionAggressive(coord, precision));
  }
  return coordinates.map(coord => parseFloat(coord.toFixed(precision)));
}

// Basic geometry simplification
function simplifyGeometry(geometry) {
  if (!geometry || !geometry.coordinates) return geometry;
  
  return {
    ...geometry,
    coordinates: reduceCoordinatePrecision(geometry.coordinates)
  };
}

// Aggressive polygon simplification using Douglas-Peucker algorithm
function simplifyPolygon(coordinates, tolerance = 0.01) {
  if (!coordinates || coordinates.length < 3) return coordinates;
  
  // Simple Douglas-Peucker implementation
  function getPerpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    
    if (dx === 0 && dy === 0) {
      return Math.sqrt(Math.pow(point[0] - lineStart[0], 2) + Math.pow(point[1] - lineStart[1], 2));
    }
    
    const normalLength = Math.sqrt(dx * dx + dy * dy);
    return Math.abs(dy * point[0] - dx * point[1] + lineEnd[0] * lineStart[1] - lineEnd[1] * lineStart[0]) / normalLength;
  }
  
  function douglasPeucker(points, tolerance) {
    if (points.length <= 2) return points;
    
    let maxDistance = 0;
    let maxIndex = 0;
    
    for (let i = 1; i < points.length - 1; i++) {
      const distance = getPerpendicularDistance(points[i], points[0], points[points.length - 1]);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }
    
    if (maxDistance > tolerance) {
      const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
      const right = douglasPeucker(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    } else {
      return [points[0], points[points.length - 1]];
    }
  }
  
  return douglasPeucker(coordinates, tolerance);
}

// Aggressive geometry simplification
function simplifyGeometryAggressive(geometry, tolerance = 0.005) {
  if (!geometry || !geometry.coordinates) return geometry;
  
  let simplified = { ...geometry };
  
  if (geometry.type === 'Polygon') {
    simplified.coordinates = geometry.coordinates.map(ring => {
      const simplifiedRing = simplifyPolygon(ring, tolerance);
      return reduceCoordinatePrecisionAggressive(simplifiedRing, 3);
    });
  } else if (geometry.type === 'MultiPolygon') {
    simplified.coordinates = geometry.coordinates.map(polygon => 
      polygon.map(ring => {
        const simplifiedRing = simplifyPolygon(ring, tolerance);
        return reduceCoordinatePrecisionAggressive(simplifiedRing, 3);
      })
    );
  }
  
  return simplified;
}

// Remove tiny polygons and holes
function removeSmallFeatures(geometry, minArea = 0.001) {
  if (!geometry || !geometry.coordinates) return geometry;
  
  function calculatePolygonArea(coordinates) {
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      area += coordinates[i][0] * coordinates[i + 1][1] - coordinates[i + 1][0] * coordinates[i][1];
    }
    return Math.abs(area) / 2;
  }
  
  if (geometry.type === 'Polygon') {
    const filteredRings = geometry.coordinates.filter(ring => {
      const area = calculatePolygonArea(ring);
      return area > minArea;
    });
    
    if (filteredRings.length === 0) return null;
    return { ...geometry, coordinates: filteredRings };
  } else if (geometry.type === 'MultiPolygon') {
    const filteredPolygons = geometry.coordinates
      .map(polygon => {
        const filteredRings = polygon.filter(ring => {
          const area = calculatePolygonArea(ring);
          return area > minArea;
        });
        return filteredRings.length > 0 ? filteredRings : null;
      })
      .filter(Boolean);
    
    if (filteredPolygons.length === 0) return null;
    return { ...geometry, coordinates: filteredPolygons };
  }
  
  return geometry;
}

// Combine multiple geometries into a single MultiPolygon
function combineGeometries(geometries) {
  const coordinates = [];
  
  for (const geom of geometries) {
    if (!geom || !geom.coordinates) continue;
    
    if (geom.type === 'Polygon') {
      coordinates.push(geom.coordinates);
    } else if (geom.type === 'MultiPolygon') {
      coordinates.push(...geom.coordinates);
    }
  }
  
  return {
    type: 'MultiPolygon',
    coordinates: coordinates
  };
}

// Fetch all OZ data with pagination
async function fetchAllOZData() {
  console.log('>>> Starting OZ data fetch...');
  
  const baseUrl = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Opportunity_Zones/FeatureServer/13/query';
  
  let allFeatures = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const url = `${baseUrl}?outFields=*&where=1%3D1&f=geojson&resultRecordCount=2000&resultOffset=${offset}`;
    console.log(`📦 Fetching batch ${Math.floor(offset/2000) + 1} (offset: ${offset})`);
    
    try {
      const data = await fetchJson(url);
      
      if (data.features && data.features.length > 0) {
        allFeatures.push(...data.features);
        offset += data.features.length;
        hasMore = data.features.length === 2000;
        console.log(`   [OK] Got ${data.features.length} features (total: ${allFeatures.length})`);
        
        // Be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`[ERROR] Error fetching batch at offset ${offset}:`, error.message);
      console.log('   -> Retrying after 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const retryData = await fetchJson(url);
        if (retryData.features && retryData.features.length > 0) {
          allFeatures.push(...retryData.features);
          offset += retryData.features.length;
          hasMore = retryData.features.length === 2000;
          console.log(`   [OK] Retry successful: ${retryData.features.length} features (total: ${allFeatures.length})`);
        } else {
          hasMore = false;
        }
      } catch (retryError) {
        console.error(`[ERROR] Retry failed:`, retryError.message);
        hasMore = false;
      }
    }
  }
  
  console.log(`*** Total OZ features fetched: ${allFeatures.length}`);
  return allFeatures;
}

// Load existing intermediate data
function loadIntermediateData() {
  const inputPath = path.join(process.cwd(), 'public', 'data', 'opportunity-zones-optimized.geojson');
  
  if (!fs.existsSync(inputPath)) {
    throw new Error('Intermediate file not found. Run without --skip-fetch first.');
  }
  
  console.log('>>> Loading existing intermediate data...');
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(rawData);
  
  return data;
}

// Process and optimize OZ data (basic optimization)
function processOZData(features) {
  console.log('>>> Processing and optimizing data (basic)...');
  
  // Group features by state
  const stateGroups = {};
  let processedCount = 0;
  
  for (const feature of features) {
    const stateName = feature.properties?.STATE_NAME;
    if (!stateName || !feature.geometry) {
      continue;
    }
    
    if (!stateGroups[stateName]) {
      stateGroups[stateName] = {
        features: [],
        ozCount: 0
      };
    }
    
    // Apply basic simplification
    const simplifiedGeometry = simplifyGeometry(feature.geometry);
    stateGroups[stateName].features.push({
      ...feature,
      geometry: simplifiedGeometry
    });
    stateGroups[stateName].ozCount++;
    processedCount++;
  }
  
  console.log(`   [STATS] Processed ${processedCount} features across ${Object.keys(stateGroups).length} states`);
  
  // Create optimized GeoJSON with combined state geometries
  const optimizedFeatures = [];
  let totalOZCount = 0;
  
  for (const [stateName, group] of Object.entries(stateGroups)) {
    // Combine all geometries for this state
    const geometries = group.features.map(f => f.geometry).filter(Boolean);
    const combinedGeometry = combineGeometries(geometries);
    
    optimizedFeatures.push({
      type: 'Feature',
      properties: {
        state: stateName,
        ozCount: group.ozCount
      },
      geometry: combinedGeometry
    });
    
    totalOZCount += group.ozCount;
    console.log(`   [MAP] ${stateName}: ${group.ozCount} OZs combined`);
  }
  
  const optimizedGeoJSON = {
    type: 'FeatureCollection',
    properties: {
      generatedAt: new Date().toISOString(),
      totalOZCount: totalOZCount,
      stateCount: optimizedFeatures.length,
      description: 'Optimized US Opportunity Zones grouped by state'
    },
    features: optimizedFeatures
  };
  
  console.log(`*** Basic optimization complete: ${totalOZCount} OZs → ${optimizedFeatures.length} state features`);
  return optimizedGeoJSON;
}

// Apply aggressive optimization to already processed data
function applyAggressiveOptimization(data) {
  console.log('>>> Applying aggressive optimization...');
  
  const optimizedFeatures = [];
  
  for (const [index, feature] of data.features.entries()) {
    const stateName = feature.properties.state;
    console.log(`   [MAP] Processing ${stateName} (${index + 1}/${data.features.length})`);
    
    // Apply aggressive simplification
    let simplified = simplifyGeometryAggressive(feature.geometry, 0.005);
    simplified = removeSmallFeatures(simplified, 0.001);
    
    if (simplified) {
      optimizedFeatures.push({
        type: 'Feature',
        properties: {
          state: stateName,
          ozCount: feature.properties.ozCount
        },
        geometry: simplified
      });
    }
  }
  
  const compressedData = {
    type: 'FeatureCollection',
    properties: {
      generatedAt: new Date().toISOString(),
      totalOZCount: data.properties.totalOZCount,
      stateCount: optimizedFeatures.length,
      description: 'Aggressively optimized US Opportunity Zones grouped by state',
      optimization: 'High compression with geometric simplification'
    },
    features: optimizedFeatures
  };
  
  console.log(`*** Aggressive optimization complete: ${optimizedFeatures.length} state features`);
  return compressedData;
}

// Main execution
async function main() {
  try {
    console.log('*** Complete OZ Data Optimization Pipeline Starting...\n');
    
    let optimizedData;
    
    if (options.skipFetch) {
      // Load existing intermediate data
      optimizedData = loadIntermediateData();
    } else {
      // Fetch and process data
      const features = await fetchAllOZData();
      
      if (features.length === 0) {
        throw new Error('No OZ data fetched');
      }
      
      // Process and optimize
      optimizedData = processOZData(features);
      
      // Save intermediate file if debug mode
      if (options.debug) {
        const outputDir = path.join(process.cwd(), 'public', 'data');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const intermediatePath = path.join(outputDir, 'opportunity-zones-optimized.geojson');
        fs.writeFileSync(intermediatePath, JSON.stringify(optimizedData, null, 2));
        console.log(`[DEBUG] Intermediate file saved to ${intermediatePath}`);
      }
    }
    
    // Apply aggressive optimization
    const compressedData = applyAggressiveOptimization(optimizedData);
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save final compressed file
    const outputPath = path.join(outputDir, 'opportunity-zones-compressed.geojson');
    const outputJson = JSON.stringify(compressedData);
    fs.writeFileSync(outputPath, outputJson);
    
    // Calculate final statistics
    const fileSizeMB = (outputJson.length / (1024 * 1024)).toFixed(2);
    
    console.log('\n*** COMPLETE SUCCESS! ***');
    console.log(`[FILE] Final output: ${outputPath}`);
    console.log(`[SIZE] Final size: ${fileSizeMB} MB`);
    console.log(`[STATS] Features: ${compressedData.features.length} states`);
    console.log(`[STATS] Total OZs: ${compressedData.properties.totalOZCount}`);
    console.log('\n[INFO] Update your component to use: /data/opportunity-zones-compressed.geojson');
    
    if (!options.debug && !options.skipFetch) {
      console.log('*** No intermediate files created - pipeline completed in memory!');
    }
    
  } catch (error) {
    console.error('\n[ERROR] Pipeline failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 