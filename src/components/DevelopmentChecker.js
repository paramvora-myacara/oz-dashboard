'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import * as turf from '@turf/turf';

export default function DevelopmentChecker() {
  const [ozData, setOzData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputType, setInputType] = useState('address'); // 'address' or 'coordinates'
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  
  // Google Places Autocomplete
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Debug: Check API key on component mount
  useEffect(() => {
    console.log('🔑 Google Maps API Key check:', {
      isSet: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      keyPreview: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 
        ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10) + '...'
        : 'NOT SET'
    });
  }, []);

  // Debug: Track input ref changes
  useEffect(() => {
    console.log('📝 Input ref changed:', {
      current: inputRef.current,
      isAttached: inputRef.current ? document.contains(inputRef.current) : false
    });
  }, [inputRef.current]);

  // Debug: Track input type changes  
  useEffect(() => {
    console.log('🔄 Input type changed to:', inputType);
  }, [inputType]);

  // Load OZ data on component mount
  useEffect(() => {
    const loadOZData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/opportunity-zones-compressed.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load OZ data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('OZ data loaded:', data.features?.length, 'zones');
        setOzData(data);
      } catch (err) {
        console.error('Error loading OZ data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOZData();
  }, []);

  // Initialize Google Places Autocomplete using the new Places API
  useEffect(() => {
    console.log('🔍 New Autocomplete useEffect triggered with:', {
      inputType,
      hasInputRef: !!inputRef.current,
      hasAutocompleteRef: !!autocompleteRef.current
    });
    
    if (inputType !== 'address' || autocompleteRef.current) {
      return;
    }
    
    let mounted = true;
    
    const initNewAutocomplete = async () => {
      // Wait for input container to be available
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts && !inputRef.current) {
        console.log(`⏳ Waiting for input container (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!inputRef.current) {
        console.error('❌ Input container never became available');
        return;
      }
      
      console.log('✅ Input container found, starting new autocomplete initialization...');
      
      try {
        console.log('📦 Loading Google Maps with Loader first...');
        
        // First load Google Maps using the existing Loader
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        console.log('✅ Google Maps loaded via Loader');
        
        // Now load the new places library
        await google.maps.importLibrary("places");
        console.log('✅ Places library (new) imported');
        
        if (!mounted || !inputRef.current) {
          console.log('❌ Component unmounted or input missing during load');
          return;
        }
        
        console.log('🔄 Creating new PlaceAutocompleteElement...');
        console.log('🔧 Google Maps Version:', google.maps.version);
        console.log('🔧 Available libraries:', Object.keys(google.maps));
        console.log('🔧 Places library check:', !!google.maps.places);
        console.log('🔧 PlaceAutocompleteElement check:', !!google.maps.places?.PlaceAutocompleteElement);
        
        // Create the new PlaceAutocompleteElement (minimal configuration)
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        console.log('✅ PlaceAutocompleteElement created successfully:', placeAutocomplete);
        
        // Apply styling to match our theme - let container handle background and border
        placeAutocomplete.style.width = '100%';
        placeAutocomplete.style.border = 'none';
        placeAutocomplete.style.borderRadius = '0.5rem';
        placeAutocomplete.style.backgroundColor = 'transparent';
        placeAutocomplete.style.minHeight = '48px';
        placeAutocomplete.style.fontSize = '16px';
        placeAutocomplete.style.outline = 'none';
        
        // Clear the input container and append the new element
        inputRef.current.innerHTML = '';
        inputRef.current.appendChild(placeAutocomplete);
        
        console.log('✅ PlaceAutocompleteElement created and added to DOM');

        // Add event listener for place selection
        placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
          console.log('📍 Place selected from new autocomplete');
          
          try {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
            
            if (place.location) {
              const displayName = place.displayName || place.formattedAddress;
              setAddress(displayName);
              checkOZStatus(
                place.location.lat(),
                place.location.lng(),
                displayName
              );
            }
          } catch (error) {
            console.error('Error processing place selection:', error);
          }
        });

        if (mounted) {
          autocompleteRef.current = placeAutocomplete;
          console.log('✅ New autocomplete initialization complete');
        }
        
      } catch (error) {
        console.error('❌ New autocomplete initialization failed:', error);
        console.warn('Falling back to manual address entry');
        
        // Fallback: show a regular input field
        if (inputRef.current && mounted) {
          const fallbackInput = document.createElement('input');
          fallbackInput.type = 'text';
          fallbackInput.placeholder = 'Enter address manually';
          fallbackInput.value = address;
          fallbackInput.style.width = '100%';
          fallbackInput.style.padding = '12px 16px';
          fallbackInput.style.border = 'none';
          fallbackInput.style.borderRadius = '0.5rem';
          fallbackInput.style.backgroundColor = 'transparent';
          fallbackInput.style.minHeight = '48px';
          fallbackInput.style.fontSize = '16px';
          fallbackInput.style.outline = 'none';
          fallbackInput.style.color = 'black';
          
          fallbackInput.addEventListener('input', (e) => {
            setAddress(e.target.value);
          });
          
          inputRef.current.innerHTML = '';
          inputRef.current.appendChild(fallbackInput);
        }
      }
    };
    
    initNewAutocomplete();

    return () => {
      mounted = false;

      // If an autocomplete element exists, remove it and clear references
      if (autocompleteRef.current) {
        try {
          // Detach the element from the DOM entirely
          autocompleteRef.current.remove();
        } catch (e) {
          console.warn('Error removing autocomplete element:', e);
        }
        autocompleteRef.current = null;
      }

      // Also clear any leftover markup inside the input container
      if (inputRef.current) {
        inputRef.current.innerHTML = '';
      }
    };
  }, [inputType]);

  // Check OZ status using coordinates
  const checkOZStatus = async (lat, lng, locationName = null) => {
    if (!ozData || !lat || !lng) return;

    setChecking(true);
    setResult(null);

    try {
      const point = turf.point([parseFloat(lng), parseFloat(lat)]);
      
      // Check if point is within any OZ polygon
      const matchingZone = ozData.features.find(feature => {
        try {
          return turf.booleanPointInPolygon(point, feature);
        } catch (err) {
          console.warn('Error checking polygon:', err);
          return false;
        }
      });

      const resultData = {
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        location: locationName || `${lat}, ${lng}`,
        isInOZ: !!matchingZone,
        ozInfo: matchingZone ? {
          name: matchingZone.properties?.NAME || 'Unknown',
          geoid: matchingZone.properties?.GEOID || matchingZone.properties?.geoid || 'Unknown',
          state: matchingZone.properties?.STATE || 'Unknown',
          county: matchingZone.properties?.COUNTY || 'Unknown',
          tractce: matchingZone.properties?.TRACTCE || 'Unknown'
        } : null
      };

      setResult(resultData);
    } catch (err) {
      console.error('Error checking OZ status:', err);
      setError('Error checking location. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  // Handle coordinate input check
  const handleCoordinateCheck = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Please enter valid coordinate ranges (lat: -90 to 90, lng: -180 to 180)');
      return;
    }

    setError(null);
    checkOZStatus(lat, lng);
  };

  // Handle address geocoding and check
  const handleAddressCheck = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        checkOZStatus(location.lat, location.lng, data.results[0].formatted_address);
      } else {
        setError('Address not found. Please try a different address.');
        setChecking(false);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Error finding address. Please try again.');
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Show the UI structure while loading */}
        <div className="flex bg-white/50 dark:bg-white/5 rounded-xl p-1 border border-black/10 dark:border-white/10 opacity-50">
          <div className="flex-1 py-3 px-4 rounded-lg text-sm font-medium text-black/60 dark:text-white/60">
            Search by Address
          </div>
          <div className="flex-1 py-3 px-4 rounded-lg text-sm font-medium text-black/60 dark:text-white/60">
            Use Coordinates
          </div>
        </div>
        
        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-6 border border-black/10 dark:border-white/10">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-black/60 dark:text-white/60">
              <div className="w-4 h-4 bg-[#0071e3] rounded-full animate-pulse"></div>
              <p>Loading Opportunity Zone data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !ozData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0071e3] text-white rounded-lg hover:bg-[#0077ed] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Input Type Toggle */}
      <div className="flex bg-white/50 dark:bg-white/5 rounded-xl p-1 border border-black/10 dark:border-white/10">
        <button
          onClick={() => setInputType('address')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all text-sm font-medium ${
            inputType === 'address'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          Search by Address
        </button>
        <button
          onClick={() => setInputType('coordinates')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all text-sm font-medium ${
            inputType === 'coordinates'
              ? 'bg-[#0071e3] text-white shadow-sm'
              : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
          }`}
        >
          Use Coordinates
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl p-6 border border-black/10 dark:border-white/10">
        {inputType === 'address' ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-black dark:text-white">
              Property Address
            </label>
            {/* Container for the new PlaceAutocompleteElement */}
            <div 
              ref={inputRef}
              className="w-full min-h-[48px] bg-white border border-black/20 dark:border-white/20 rounded-lg focus-within:ring-2 focus-within:ring-[#0071e3] focus-within:border-[#0071e3]"
              style={{
                // Ensure the autocomplete element fits nicely
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* This will be replaced by PlaceAutocompleteElement or fallback input */}
            </div>
            {!autocompleteRef.current && (
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                Note: Loading address autocomplete...
              </p>
            )}
            <button
              onClick={handleAddressCheck}
              disabled={checking || !address.trim()}
              className="w-full py-3 px-6 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {checking ? 'Checking...' : 'Check Location'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-black dark:text-white">
              Coordinates
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude (e.g., 40.7128)"
                className="px-4 py-3 bg-white border border-black/20 dark:border-white/20 rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3]"
              />
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude (e.g., -74.0060)"
                className="px-4 py-3 bg-white border border-black/20 dark:border-white/20 rounded-lg text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3]"
              />
            </div>
            <button
              onClick={handleCoordinateCheck}
              disabled={checking || !latitude || !longitude}
              className="w-full py-3 px-6 bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {checking ? 'Checking...' : 'Check Coordinates'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-6 border border-black/10 dark:border-white/10">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              result.isInOZ 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {result.isInOZ ? (
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              )}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              result.isInOZ 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {result.isInOZ ? 'Yes! This location is in an Opportunity Zone' : 'No, this location is not in an Opportunity Zone'}
            </h3>
            <p className="text-black/60 dark:text-white/60">
              Location: {result.location}
            </p>
          </div>

          {result.isInOZ && result.ozInfo && (
            <div className="border-t border-black/10 dark:border-white/10 pt-6">
              <h4 className="font-semibold text-black dark:text-white mb-4">Opportunity Zone Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-black/60 dark:text-white/60">Zone Name:</span>
                  <span className="block font-medium text-black dark:text-white">{result.ozInfo.name}</span>
                </div>
                <div>
                  <span className="text-black/60 dark:text-white/60">Census Tract:</span>
                  <span className="block font-medium text-black dark:text-white">{result.ozInfo.geoid}</span>
                </div>
                <div>
                  <span className="text-black/60 dark:text-white/60">State:</span>
                  <span className="block font-medium text-black dark:text-white">{result.ozInfo.state}</span>
                </div>
                <div>
                  <span className="text-black/60 dark:text-white/60">County:</span>
                  <span className="block font-medium text-black dark:text-white">{result.ozInfo.county}</span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-black/10 dark:border-white/10 pt-6 mt-6 text-center">
            <p className="text-black/60 dark:text-white/60 text-sm mb-4">
              Coordinates: {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
            </p>
            <button
              onClick={() => {
                setResult(null);
                setAddress('');
                setLatitude('');
                setLongitude('');
                setError(null);
              }}
              className="px-6 py-2 border border-black/20 dark:border-white/20 text-black dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Check Another Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 