# Opportunity Zone Checker System

This system provides a complete solution for checking if a location (address or coordinates) is within a designated US Opportunity Zone. It combines the US Census geocoding API with our optimized GEOID lookup table for fast, accurate results.

## What Was Built

### 1. Data Collection Scripts

#### `scripts/fetch-raw-oz-data.js`
- Downloads all 8,765 individual Opportunity Zone census tracts from the US government ArcGIS service
- Saves raw data with complete tract information including GEOIDs
- Output: `public/data/oz-tracts.json` (157MB)

#### `scripts/create-geoid-lookup.js`
- Processes raw OZ data to create optimized lookup tables
- Creates both full and minimal versions for different use cases
- Outputs:
  - `public/data/oz-geoid-lookup.json` (1.4MB) - Full data with metadata
  - `public/data/oz-geoid-minimal.json` (120KB) - Minimal data for client-side use

### 2. API Enhancement

#### `src/app/api/census-geocoder/route.js`
- Enhanced Census geocoding API that supports both forward and reverse geocoding
- Forward: Address → Coordinates + GEOID
- Reverse: Coordinates → GEOID + Address
- Returns detailed census data (state, county, tract, block)

### 3. OZ Checker Utility

#### `src/lib/ozChecker.js`
- Client-side utility class for checking OZ status
- Automatically loads and caches the minimal lookup data (120KB)
- Provides multiple checking methods:
  - `checkAddress(address)` - Check an address string
  - `checkCoordinates(lat, lng)` - Check coordinates
  - `isOZ(geoid)` - Direct GEOID lookup

### 4. Updated Check-OZ Page

#### `src/app/check-oz/page.js`
- Modern, responsive UI for checking OZ status
- Google Places autocomplete for address input
- Current location checking via browser geolocation
- Detailed results with census information
- Efficient loading (120KB vs. previous 157MB)

## How to Use

### For Developers

```javascript
import { checkAddress, checkCoordinates } from '@/lib/ozChecker';

// Check an address
const result = await checkAddress('123 Main St, Anytown, NY 12345');
if (result.success && result.isOpportunityZone) {
  console.log('This address is in an OZ!');
  console.log('GEOID:', result.geoid);
  console.log('Coordinates:', result.coordinates);
}

// Check coordinates
const coordResult = await checkCoordinates(40.7128, -74.0060);
if (coordResult.success) {
  console.log('OZ Status:', coordResult.isOpportunityZone);
}
```

### For Users

1. Visit `/check-oz` in your browser
2. Type an address in the search box (Google autocomplete will help)
3. Click "Check OZ Status" or use "Use My Location"
4. Get instant results with detailed information

## Data Files

| File | Size | Purpose | Usage |
|------|------|---------|-------|
| `oz-tracts.json` | 157MB | Raw OZ data | Development/analysis only |
| `oz-geoid-lookup.json` | 1.4MB | Full lookup with metadata | Server-side if metadata needed |
| `oz-geoid-minimal.json` | 120KB | Minimal client lookup | **Recommended for production** |
| `opportunity-zones-compressed.geojson` | 1MB | Geographic boundaries | Map visualization |

## Technical Details

### Performance
- **Client-side lookup**: O(1) using JavaScript Set
- **Data transfer**: Only 120KB vs. 157MB (99.9% reduction)
- **Accuracy**: Based on official 11-digit census tract GEOIDs
- **Coverage**: All 8,765 OZ tracts across US states and territories

### Architecture
```
User Input (Address/Coordinates)
         ↓
Census Geocoding API (/api/census-geocoder)
         ↓
Extract GEOID
         ↓
Client-side Lookup (oz-geoid-minimal.json)
         ↓
Return OZ Status + Details
```

## Running the Scripts

```bash
# Download raw OZ data (required first)
node scripts/fetch-raw-oz-data.js

# Create lookup tables from raw data
node scripts/create-geoid-lookup.js

# Optional: Run original optimization pipeline
node scripts/optimize-oz-data-complete.js --debug
```

## API Endpoints

### `/api/census-geocoder`

**Forward Geocoding:**
```json
POST /api/census-geocoder
{
  "address": "123 Main St, Anytown, NY 12345"
}
```

**Reverse Geocoding:**
```json
POST /api/census-geocoder
{
  "lat": 40.7128,
  "lng": -74.0060,
  "reverseGeocode": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lat": 40.7128,
    "lng": -74.0060,
    "geoid": "36061000100",
    "matchedAddress": "123 Main St, New York, NY 10001",
    "state": "36",
    "county": "061",
    "tract": "000100",
    "block": "1001"
  }
}
```

## Next Steps

1. **Test the system**: Visit `/check-oz` and try different addresses
2. **Monitor performance**: Check network tab for data loading efficiency
3. **Consider caching**: The minimal lookup data can be cached in localStorage
4. **Verify accuracy**: Cross-check results with official OZ databases
5. **Add analytics**: Track usage patterns and common queries

## Important Notes

- **This tool is for informational purposes only**
- **Always verify with official sources before making investment decisions**
- **Consult qualified tax professionals for OZ investment guidance**
- **OZ designations can change - check for updates periodically**

The system provides a solid foundation for OZ checking that balances accuracy, performance, and user experience. 