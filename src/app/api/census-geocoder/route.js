import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Check if this is a reverse geocoding request (coordinates to GEOID)
    if (body.reverseGeocode && body.lat && body.lng) {
      return await handleReverseGeocode(body.lat, body.lng);
    }
    
    // Otherwise, handle forward geocoding (address to coordinates/GEOID)
    if (!body.address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address is required for forward geocoding' 
      }, { status: 400 });
    }
    
    return await handleForwardGeocode(body.address);
    
  } catch (error) {
    console.error('Census geocoder error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

function cleanAddressForCensus(address) {
  return address
    // Remove country suffixes
    .replace(/, USA$/, '')
    .replace(/, United States$/, '')
    .replace(/, US$/, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function tryCensusGeocode(address, retries = 2) {
  const cleanedAddress = cleanAddressForCensus(address);
  const encodedAddress = encodeURIComponent(cleanedAddress);
  const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?address=${encodedAddress}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Census API attempt ${attempt}:`, censusUrl);
      
      const response = await fetchWithTimeout(censusUrl, {}, 8000); // 8 second timeout
      
      if (!response.ok) {
        console.error('Census API HTTP error:', response.status, response.statusText);
        if (attempt === retries) {
          throw new Error(`Census API error: ${response.statusText}`);
        }
        continue; // Try again
      }

      const data = await response.json();
      console.log('Census API response:', JSON.stringify(data, null, 2));
      
      if (data.result && data.result.addressMatches && data.result.addressMatches.length > 0) {
        return { success: true, data: data.result.addressMatches[0] };
      }
      
      // No matches found
      return { success: false, error: 'No address match found in Census database' };
      
    } catch (error) {
      console.error(`Census API attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        return { success: false, error: `Census API timeout/error: ${error.message}` };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function tryGoogleGeocode(address) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const encodedAddress = encodeURIComponent(address);
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  try {
    console.log('Trying Google Geocoding API as fallback...');
    const response = await fetchWithTimeout(googleUrl, {}, 8000);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Google geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Now reverse geocode through Census to get GEOID
    return await handleReverseGeocode(location.lat, location.lng);
    
  } catch (error) {
    console.error('Google geocoding failed:', error.message);
    throw error;
  }
}

async function handleForwardGeocode(address) {
  console.log('Raw address received:', address);
  
  // First try Census API
  const censusResult = await tryCensusGeocode(address);
  
  if (censusResult.success) {
    // Process Census result
    const match = censusResult.data;
    const coordinates = match.coordinates;
    const geographies = match.geographies;
    
    if (!coordinates || !geographies) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid data from Census API' 
      });
    }

    const censusTract = geographies['Census Tracts']?.[0];
    const censusBlock = geographies['Census Blocks']?.[0];
    const county = geographies['Counties']?.[0];
    const state = geographies['States']?.[0];
    
    const geoid = censusTract?.GEOID || censusBlock?.GEOID?.slice(0, 11);
    
    if (!geoid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not determine census tract GEOID' 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        lat: coordinates.y,
        lng: coordinates.x,
        geoid: geoid,
        matchedAddress: match.matchedAddress,
        state: censusTract?.GEOID?.slice(0, 2) || state?.GEOID || censusBlock?.GEOID?.slice(0, 2),
        county: censusTract?.GEOID?.slice(2, 5) || county?.GEOID?.slice(2, 5) || censusBlock?.GEOID?.slice(2, 5),
        tract: censusTract?.GEOID?.slice(5, 11) || censusBlock?.GEOID?.slice(5, 11),
        block: censusBlock?.GEOID?.slice(11, 15),
        tractName: censusTract?.NAME,
        countyName: county?.NAME,
        stateName: state?.NAME
      }
    });
  }

  // Census failed, try Google as fallback
  console.log('Census API failed, trying Google Geocoding as fallback...');
  
  try {
    const googleResult = await tryGoogleGeocode(address);
    return googleResult;
  } catch (error) {
    console.error('All geocoding methods failed:', error.message);
    
    // Provide helpful error message
    const isLandmark = !address.match(/^\d+\s/); // Doesn't start with a number
    
    if (isLandmark) {
      return NextResponse.json({ 
        success: false, 
        error: 'Address not found. Building/landmark names may not work. Please try a specific street address with number (e.g., "123 Main Street, Tampa, FL").' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Address geocoding failed. Please verify the address and try again.' 
    });
  }
}

async function handleReverseGeocode(lat, lng) {
  // Use Census reverse geocoding service with geographies endpoint
  const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

  console.log('Reverse geocoding coordinates:', lat, lng);
  console.log('Census reverse geocoding URL:', censusUrl);

  try {
    const response = await fetchWithTimeout(censusUrl, {}, 8000);
    if (!response.ok) {
      throw new Error(`Census reverse geocoding error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Census reverse geocoding response:', JSON.stringify(data, null, 2));
    
    if (!data.result || !data.result.geographies) {
      return NextResponse.json({ 
        success: false, 
        error: 'No geographic data found for coordinates' 
      });
    }

    const geographies = data.result.geographies;
    const censusTract = geographies['Census Tracts']?.[0];
    const censusBlock = geographies['Census Blocks']?.[0];
    const county = geographies['Counties']?.[0];
    const state = geographies['States']?.[0];
    
    if (!censusTract && !censusBlock) {
      return NextResponse.json({ 
        success: false, 
        error: 'No census tract found for coordinates' 
      });
    }

    // Use tract GEOID if available, otherwise extract tract portion from block GEOID
    const geoid = censusTract?.GEOID || censusBlock?.GEOID?.slice(0, 11);
    
    if (!geoid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not determine census tract GEOID' 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        lat: lat,
        lng: lng,
        geoid: geoid,
        matchedAddress: `${county?.NAME || 'Unknown'} County, ${state?.NAME || 'Unknown'}`,
        // State info
        state: censusTract?.GEOID?.slice(0, 2) || state?.GEOID || censusBlock?.GEOID?.slice(0, 2),
        // County info
        county: censusTract?.GEOID?.slice(2, 5) || county?.GEOID?.slice(2, 5) || censusBlock?.GEOID?.slice(2, 5),
        // Tract info
        tract: censusTract?.GEOID?.slice(5, 11) || censusBlock?.GEOID?.slice(5, 11),
        // Block info if available
        block: censusBlock?.GEOID?.slice(11, 15),
        // Additional metadata
        tractName: censusTract?.NAME,
        countyName: county?.NAME,
        stateName: state?.NAME
      }
    });

  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: `Reverse geocoding failed: ${error.message}` 
    });
  }
} 