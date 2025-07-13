#!/usr/bin/env node

// Fetch raw OZ data and save individual tract information
// Run with: node scripts/fetch-raw-oz-data.js

const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Fetch all OZ data with pagination
async function fetchAllOZData() {
  console.log('>>> Starting raw OZ data fetch...');
  
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

// Main execution
async function main() {
  try {
    console.log('*** Raw OZ Data Fetch Starting...\n');
    
    // Fetch raw data
    const features = await fetchAllOZData();
    
    if (features.length === 0) {
      throw new Error('No OZ data fetched');
    }
    
    // Create raw GeoJSON
    const rawGeoJSON = {
      type: 'FeatureCollection',
      properties: {
        generatedAt: new Date().toISOString(),
        totalFeatures: features.length,
        description: 'Raw US Opportunity Zones data with all individual tract information'
      },
      features: features
    };
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save raw data
    const outputPath = path.join(outputDir, 'oz-tracts.json');
    const outputJson = JSON.stringify(rawGeoJSON);
    fs.writeFileSync(outputPath, outputJson);
    
    // Calculate statistics
    const fileSizeMB = (outputJson.length / (1024 * 1024)).toFixed(2);
    
    // Log sample of properties to understand structure
    console.log('\n>>> Sample feature properties:');
    if (features.length > 0 && features[0].properties) {
      console.log(JSON.stringify(features[0].properties, null, 2));
    }
    
    console.log('\n*** SUCCESS! ***');
    console.log(`[FILE] Raw data saved to: ${outputPath}`);
    console.log(`[SIZE] File size: ${fileSizeMB} MB`);
    console.log(`[STATS] Total features: ${features.length}`);
    
  } catch (error) {
    console.error('\n[ERROR] Fetch failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 