#!/usr/bin/env node

// Create GEOID lookup table from raw OZ data
// Run with: node scripts/create-geoid-lookup.js

const fs = require('fs');
const path = require('path');

// Main execution
async function main() {
  try {
    console.log('*** Creating GEOID Lookup Table...\n');
    
    // Load raw OZ data
    const inputPath = path.join(process.cwd(), 'public', 'data', 'oz-tracts.json');
    
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Raw OZ data not found at ${inputPath}. Run fetch-raw-oz-data.js first.`);
    }
    
    console.log('>>> Loading raw OZ data...');
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    if (!rawData.features || !Array.isArray(rawData.features)) {
      throw new Error('Invalid data format');
    }
    
    console.log(`[INFO] Loaded ${rawData.features.length} OZ features`);
    
    // Create GEOID lookup table
    console.log('>>> Creating GEOID lookup table...');
    const geoidLookup = {};
    const geoidArray = [];
    const stateStats = {};
    let processedCount = 0;
    let skipCount = 0;
    
    for (const feature of rawData.features) {
      const properties = feature.properties;
      
      if (!properties || !properties.GEOID10) {
        skipCount++;
        continue;
      }
      
      const geoid = properties.GEOID10;
      const stateName = properties.STATE_NAME;
      const state = properties.STATE;
      const county = properties.COUNTY;
      const tract = properties.TRACT;
      
      // Add to hashmap lookup (for O(1) lookup)
      geoidLookup[geoid] = {
        isOZ: true,
        state: stateName,
        stateCode: state,
        county: county,
        tract: tract
      };
      
      // Add to array (for set-based lookups)
      geoidArray.push(geoid);
      
      // Track state statistics
      if (!stateStats[stateName]) {
        stateStats[stateName] = 0;
      }
      stateStats[stateName]++;
      
      processedCount++;
    }
    
    // Create different lookup formats for different use cases
    const lookupData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalOZTracts: processedCount,
        skippedFeatures: skipCount,
        description: 'GEOID lookup table for US Opportunity Zones',
        usage: {
          hashmap: 'Use geoidLookup[geoid] for O(1) lookup',
          array: 'Use geoidArray.includes(geoid) or new Set(geoidArray).has(geoid) for set-based lookup',
          example: 'Check if "51019050100" is an OZ: geoidLookup["51019050100"]?.isOZ'
        }
      },
      geoidLookup: geoidLookup,
      geoidArray: geoidArray,
      stateStats: stateStats
    };
    
    // Create a minimal version with just the GEOIDs for smaller bundle size
    const minimalLookup = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalOZTracts: processedCount,
        description: 'Minimal GEOID lookup for US Opportunity Zones (GEOIDs only)'
      },
      geoids: geoidArray
    };
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save full lookup table
    const fullOutputPath = path.join(outputDir, 'oz-geoid-lookup.json');
    const fullJson = JSON.stringify(lookupData, null, 2);
    fs.writeFileSync(fullOutputPath, fullJson);
    
    // Save minimal lookup table
    const minimalOutputPath = path.join(outputDir, 'oz-geoid-minimal.json');
    const minimalJson = JSON.stringify(minimalLookup);
    fs.writeFileSync(minimalOutputPath, minimalJson);
    
    // Calculate file sizes
    const fullSizeKB = (fullJson.length / 1024).toFixed(2);
    const minimalSizeKB = (minimalJson.length / 1024).toFixed(2);
    
    // Display statistics
    console.log('\n>>> Statistics by State:');
    const sortedStates = Object.entries(stateStats).sort((a, b) => b[1] - a[1]);
    for (const [state, count] of sortedStates.slice(0, 10)) {
      console.log(`   ${state}: ${count} OZ tracts`);
    }
    if (sortedStates.length > 10) {
      console.log(`   ... and ${sortedStates.length - 10} more states`);
    }
    
    // Sample usage examples
    const sampleGeoids = geoidArray.slice(0, 3);
    console.log('\n>>> Sample Usage Examples:');
    console.log('JavaScript:');
    console.log('```javascript');
    console.log(`// Load the lookup data`);
    console.log(`const lookup = await fetch('/data/oz-geoid-lookup.json').then(r => r.json());`);
    console.log(``);
    console.log(`// Check if a GEOID is an OZ (O(1) lookup)`);
    for (const geoid of sampleGeoids) {
      console.log(`console.log(lookup.geoidLookup["${geoid}"]?.isOZ); // true`);
    }
    console.log(``);
    console.log(`// For minimal bundle size, use the minimal version:`);
    console.log(`const minimal = await fetch('/data/oz-geoid-minimal.json').then(r => r.json());`);
    console.log(`const ozSet = new Set(minimal.geoids);`);
    console.log(`console.log(ozSet.has("${sampleGeoids[0]}")); // true`);
    console.log('```');
    
    console.log('\n*** SUCCESS! ***');
    console.log(`[FILE] Full lookup table: ${fullOutputPath} (${fullSizeKB} KB)`);
    console.log(`[FILE] Minimal lookup: ${minimalOutputPath} (${minimalSizeKB} KB)`);
    console.log(`[STATS] Processed ${processedCount} OZ tracts`);
    console.log(`[STATS] Skipped ${skipCount} features`);
    console.log(`[STATS] Coverage: ${Object.keys(stateStats).length} states/territories`);
    
    console.log('\n[NEXT STEPS]');
    console.log('1. Use oz-geoid-minimal.json for client-side lookups (smaller bundle)');
    console.log('2. Use oz-geoid-lookup.json if you need additional metadata');
    console.log('3. In your app, create a Set from the geoids array for O(1) lookups');
    
  } catch (error) {
    console.error('\n[ERROR] Script failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 