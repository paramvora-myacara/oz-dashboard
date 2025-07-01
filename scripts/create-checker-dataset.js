#!/usr/bin/env node

// Create optimized dataset specifically for DevelopmentChecker
// Usage: node scripts/create-checker-dataset.js [options]

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  help: args.includes('--help') || args.includes('-h'),
  precision: args.includes('--precision-3') ? 3 : 
             args.includes('--precision-4') ? 4 : 5,
  simplify: args.length === 0 ? true : args.includes('--simplify'), // Default: enabled
  tolerance: args.includes('--tolerance-low') ? 0.0001 : 
             args.includes('--tolerance-med') ? 0.0005 : 
             args.includes('--tolerance-high') ? 0.001 : 
             args.length === 0 ? 0.0001 : 0.0002, // Default: low tolerance
  aggressive: args.includes('--aggressive')
};

if (options.help) {
  console.log(`
🎯 Create DevelopmentChecker Optimized Dataset

Usage: node scripts/create-checker-dataset.js [options]

Options:
  --help, -h              Show this help message
  --precision-3           Use 3 decimal precision (~111m accuracy)
  --precision-4           Use 4 decimal precision (~11m accuracy)  
  --precision-5           Use 5 decimal precision (~1m accuracy) [default]
  --simplify              Apply geometric simplification
  --tolerance-low         Low simplification (0.0001°)
  --tolerance-med         Medium simplification (0.0005°)
  --tolerance-high        High simplification (0.001°)
  --aggressive            Use all compression techniques for maximum reduction

Examples:
  node scripts/create-checker-dataset.js                     # Default: 5-decimal + simplify + low tolerance
  node scripts/create-checker-dataset.js --precision-4       # Medium accuracy
  node scripts/create-checker-dataset.js --aggressive        # Maximum compression
  node scripts/create-checker-dataset.js --simplify --tolerance-med --precision-4

Default behavior (no arguments): --precision-5 --simplify --tolerance-low

This script optimizes for:
- Point-in-polygon checking accuracy
- Fast loading times
- Minimal file size
`);
  process.exit(0);
}

// Apply aggressive settings if requested
if (options.aggressive) {
  options.precision = 3;
  options.simplify = true;
  options.tolerance = 0.001;
}

// Reduce coordinate precision to specified decimal places
function reduceCoordinatePrecision(coordinates, precision) {
  if (Array.isArray(coordinates[0])) {
    return coordinates.map(coord => reduceCoordinatePrecision(coord, precision));
  }
  return coordinates.map(coord => parseFloat(coord.toFixed(precision)));
}

// Simple geometric simplification (Douglas-Peucker-like)
function simplifyCoordinates(coordinates, tolerance) {
  if (!Array.isArray(coordinates[0])) return coordinates;
  
  if (Array.isArray(coordinates[0][0])) {
    // MultiPolygon or nested arrays
    return coordinates.map(ring => simplifyCoordinates(ring, tolerance));
  }
  
  // Simple coordinate array - apply basic simplification
  if (coordinates.length <= 3) return coordinates; // Keep minimum viable polygon
  
  const simplified = [coordinates[0]]; // Always keep first point
  
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const next = coordinates[i + 1];
    
    // Calculate approximate distance from line between prev and next
    const distance = Math.abs(
      (next[1] - prev[1]) * curr[0] - (next[0] - prev[0]) * curr[1] + 
      next[0] * prev[1] - next[1] * prev[0]
    ) / Math.sqrt(Math.pow(next[1] - prev[1], 2) + Math.pow(next[0] - prev[0], 2));
    
    // Keep point if it's significant enough
    if (distance > tolerance) {
      simplified.push(curr);
    }
  }
  
  simplified.push(coordinates[coordinates.length - 1]); // Always keep last point
  return simplified;
}

// Optimize geometry for point-in-polygon checking
function optimizeGeometry(geometry) {
  if (!geometry || !geometry.coordinates) return geometry;
  
  let coordinates = geometry.coordinates;
  
  // Apply simplification if requested
  if (options.simplify) {
    coordinates = simplifyCoordinates(coordinates, options.tolerance);
  }
  
  // Apply precision reduction
  coordinates = reduceCoordinatePrecision(coordinates, options.precision);
  
  return {
    ...geometry,
    coordinates: coordinates
  };
}

// Calculate polygon complexity (number of coordinate points)
function calculateComplexity(feature) {
  if (!feature.geometry || !feature.geometry.coordinates) return 0;
  
  function countPoints(coords) {
    if (!Array.isArray(coords[0])) return coords.length;
    return coords.reduce((sum, ring) => sum + countPoints(ring), 0);
  }
  
  return countPoints(feature.geometry.coordinates);
}

// Main processing function
function createCheckerDataset() {
  console.log('🎯 Creating DevelopmentChecker Optimized Dataset...\n');
  
  // Display optimization settings
  console.log('⚙️  Optimization Settings:');
  console.log(`   📐 Precision: ${options.precision} decimals (~${options.precision === 5 ? '1m' : options.precision === 4 ? '11m' : '111m'} accuracy)`);
  console.log(`   🔧 Simplification: ${options.simplify ? 'YES' : 'NO'}`);
  if (options.simplify) {
    console.log(`   📏 Tolerance: ${options.tolerance}°`);
  }
  console.log('');
  
  // Input and output paths
  const inputPath = path.join(process.cwd(), 'public', 'data', 'opportunity-zones-raw.geojson');
  const outputPath = path.join(process.cwd(), 'public', 'data', 'opportunity-zones-checker.geojson');
  
  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Input file not found:', inputPath);
    console.log('💡 Run: node scripts/optimize-oz-data-complete.js --save-raw');
    process.exit(1);
  }
  
  console.log('📂 Loading raw OZ data...');
  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const inputSizeMB = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`   📏 Input size: ${inputSizeMB} MB`);
  console.log(`   📊 Input features: ${rawData.features.length}`);
  
  // Calculate input complexity
  const inputComplexity = rawData.features.reduce((sum, f) => sum + calculateComplexity(f), 0);
  console.log(`   🔢 Input coordinate points: ${inputComplexity.toLocaleString()}`);
  
  console.log('\n🔄 Optimizing features...');
  const optimizedFeatures = [];
  let processedCount = 0;
  let totalOutputComplexity = 0;
  
  for (const feature of rawData.features) {
    if (!feature.geometry || !feature.properties) {
      console.warn(`⚠️  Skipping invalid feature at index ${processedCount}`);
      continue;
    }
    
    // Extract just the GEOID from properties
    const geoid = feature.properties.GEOID || 
                  feature.properties.geoid || 
                  feature.properties.TRACTCE ||
                  `unknown_${processedCount}`;
    
    // Create optimized feature with minimal properties
    const optimizedFeature = {
      type: 'Feature',
      properties: {
        geoid: geoid
      },
      geometry: optimizeGeometry(feature.geometry)
    };
    
    optimizedFeatures.push(optimizedFeature);
    totalOutputComplexity += calculateComplexity(optimizedFeature);
    processedCount++;
    
    // Progress indicator
    if (processedCount % 1000 === 0) {
      console.log(`   ✅ Processed ${processedCount}/${rawData.features.length} features`);
    }
  }
  
  console.log(`   ✅ Processed ${processedCount}/${rawData.features.length} features`);
  console.log(`   🔢 Output coordinate points: ${totalOutputComplexity.toLocaleString()}`);
  const complexityReduction = ((1 - totalOutputComplexity / inputComplexity) * 100).toFixed(1);
  console.log(`   📉 Complexity reduction: ${complexityReduction}%`);
  
  // Create optimized dataset
  const checkerData = {
    type: 'FeatureCollection',
    properties: {
      generatedAt: new Date().toISOString(),
      totalFeatures: optimizedFeatures.length,
      description: 'Optimized US Opportunity Zones for DevelopmentChecker',
      optimization: {
        precision: `${options.precision} decimals`,
        simplification: options.simplify ? `${options.tolerance}° tolerance` : 'none',
        properties: 'GEOID only'
      },
      accuracy: options.precision === 5 ? '~1m' : options.precision === 4 ? '~11m' : '~111m',
      purpose: 'Point-in-polygon checking for DevelopmentChecker component'
    },
    features: optimizedFeatures
  };
  
  // Write output file
  console.log('\n💾 Writing optimized dataset...');
  fs.writeFileSync(outputPath, JSON.stringify(checkerData));
  
  // Calculate statistics
  const outputSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  const compressionRatio = ((1 - fs.statSync(outputPath).size / fs.statSync(inputPath).size) * 100).toFixed(1);
  
  console.log('\n🎉 SUCCESS!');
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📏 Size: ${inputSizeMB} MB → ${outputSizeMB} MB`);
  console.log(`📊 Compression: ${compressionRatio}% smaller`);
  console.log(`🎯 Features: ${checkerData.features.length} individual OZ tracts`);
  console.log(`🔧 Precision: ${options.precision} decimals`);
  console.log(`⚡ Properties: Minimal (GEOID only)`);
  console.log(`📉 Complexity: ${complexityReduction}% fewer coordinate points`);
  
  console.log('\n💡 Next steps:');
  console.log('1. Test accuracy with known OZ addresses');
  console.log('2. If accuracy is sufficient, clean up raw data file');
  console.log('3. Consider further optimization if still too large');
  
  return {
    inputSize: inputSizeMB,
    outputSize: outputSizeMB,
    compressionRatio: compressionRatio,
    featureCount: checkerData.features.length,
    complexityReduction: complexityReduction
  };
}

// Run if called directly
if (require.main === module) {
  try {
    createCheckerDataset();
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

module.exports = { createCheckerDataset }; 