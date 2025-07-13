'use client';

import { useState, useEffect, useRef } from 'react';
import ozChecker, { checkAddress, initializeOZChecker } from '@/lib/ozChecker';

export default function CheckOZPage() {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [ozDataLoaded, setOzDataLoaded] = useState(false);
  const inputRef = useRef(null);
  const predictionsRef = useRef(null);

  // Initialize OZ checker on component mount
  useEffect(() => {
    const initOZChecker = async () => {
      try {
        await initializeOZChecker();
        setOzDataLoaded(true);
        console.log('OZ checker initialized successfully');
      } catch (error) {
        console.error('Error initializing OZ checker:', error);
        setError('Failed to load OZ data. Please refresh the page.');
      }
    };
    initOZChecker();
  }, []);

  // Debounced autocomplete function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.length > 2) {
        fetchPredictions(inputValue);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const fetchPredictions = async (input) => {
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'suggestions.placePrediction.text,suggestions.placePrediction.placeId'
        },
        body: JSON.stringify({
          input: input,
          includedRegionCodes: ['us'], // Restrict to US only
          includedPrimaryTypes: ['street_address', 'premise'], // Focus on addresses
          languageCode: 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const addressPredictions = data.suggestions
          ?.filter(suggestion => suggestion.placePrediction)
          ?.map(suggestion => ({
            placeId: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text.text
          })) || [];
        
        setPredictions(addressPredictions);
        setShowPredictions(addressPredictions.length > 0);
      } else {
        console.error('Autocomplete API error:', response.status);
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const selectPrediction = (prediction) => {
    setInputValue(prediction.description);
    setSelectedAddress(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
  };

  const checkOZStatus = async () => {
    if (!selectedAddress) {
      setError('Please select an address from the suggestions');
      return;
    }

    if (!ozDataLoaded) {
      setError('OZ data is still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Checking address:', selectedAddress);
      
      // Use our new OZ checker utility
      const ozResult = await checkAddress(selectedAddress);

      if (ozResult.success) {
        setResult({
          isInOZ: ozResult.isOpportunityZone,
          geoid: ozResult.geoid,
          address: ozResult.address,
          coordinates: ozResult.coordinates,
          censusData: ozResult.censusData,
          matchedAddress: ozResult.matchedAddress
        });
      } else {
        console.error('OZ check failed:', ozResult.error);
        // Provide specific guidance based on the error
        if (ozResult.error.includes('Building/landmark names may not work')) {
          setError('Address not found. Building and landmark names don\'t work well. Please try a specific street address with number.\n\nFor example:\n• "4202 E Fowler Ave, Tampa, FL" instead of "Marshall Student Center"\n• "123 Main Street, Tampa, FL" instead of business names');
        } else if (ozResult.error.includes('No address match found')) {
          setError('Address not found. Please try:\n• Including the full street address with number\n• Verifying the address exists\n• Using a different format (e.g., "123 Main St" vs "123 Main Street")\n• Avoiding business names - use street addresses');
        } else if (ozResult.error.includes('timeout') || ozResult.error.includes('failed')) {
          setError('Service temporarily unavailable. Please try again in a moment or use the "Use My Location" button if you\'re at the property.');
        } else {
          setError(ozResult.error || 'Unable to determine if this address is in an Opportunity Zone');
        }
      }
    } catch (error) {
      console.error('Error checking OZ status:', error);
      setError('An error occurred while checking the address. Please try again or check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicks outside predictions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (predictionsRef.current && !predictionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setInputValue('');
    setSelectedAddress('');
    setPredictions([]);
    setShowPredictions(false);
    setResult(null);
    setError('');
  };

  const checkCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Import checkCoordinates function
          const { checkCoordinates } = await import('@/lib/ozChecker');
          const ozResult = await checkCoordinates(latitude, longitude);

          if (ozResult.success) {
            setResult({
              isInOZ: ozResult.isOpportunityZone,
              geoid: ozResult.geoid,
              address: 'Current Location',
              coordinates: ozResult.coordinates,
              censusData: ozResult.censusData,
              matchedAddress: ozResult.matchedAddress
            });
            setSelectedAddress('Current Location');
          } else {
            setError(ozResult.error || 'Unable to determine if your current location is in an Opportunity Zone');
          }
        } catch (error) {
          console.error('Error checking current location:', error);
          setError('An error occurred while checking your location. Please try again.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to access your location. Please check your browser permissions.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Check if Your Development is in an Opportunity Zone
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter your development address to see if it qualifies for Opportunity Zone benefits
          </p>
          {!ozDataLoaded && (
            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              Loading OZ data... ({ozChecker.getStats().totalOZTracts || '8,765'} census tracts)
            </div>
          )}
        </div>

        {/* Address Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Development Address
          </label>
          
          <div className="relative">
            <input
              ref={inputRef}
              id="address-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter street address (e.g., 123 Main Street, Tampa, FL)..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
              disabled={isLoading}
            />

            {/* Address format hint */}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              💡 Tip: Use street addresses with numbers (not business/building names) for best results
            </p>

            {/* Predictions Dropdown */}
            {showPredictions && predictions.length > 0 && (
              <div 
                ref={predictionsRef}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.placeId}
                    onClick={() => selectPrediction(prediction)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                  >
                    {prediction.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={checkOZStatus}
              disabled={isLoading || !selectedAddress || !ozDataLoaded}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Checking...' : 'Check OZ Status'}
            </button>
            
            <button
              onClick={checkCurrentLocation}
              disabled={isLoading || !ozDataLoaded}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Use My Location
            </button>
            
            <button
              onClick={resetForm}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-red-600 dark:text-red-400 mt-0.5">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-700 dark:text-red-300">
                {error.split('\n').map((line, index) => (
                  <div key={index} className={index > 0 ? 'mt-1' : ''}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`rounded-lg shadow-lg p-6 mb-6 ${
            result.isInOZ 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`text-2xl mr-3 ${result.isInOZ ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {result.isInOZ ? '✅' : '❌'}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${result.isInOZ ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
                  {result.isInOZ ? 'Opportunity Zone Qualified!' : 'Not in an Opportunity Zone'}
                </h3>
                <p className={`text-sm ${result.isInOZ ? 'text-green-600 dark:text-green-300' : 'text-orange-600 dark:text-orange-300'}`}>
                  {result.isInOZ 
                    ? 'This development may qualify for Opportunity Zone tax benefits' 
                    : 'This location does not qualify for Opportunity Zone benefits'
                  }
                </p>
              </div>
            </div>

            {/* Result Details */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address:</label>
                <p className="text-gray-900 dark:text-gray-100">{result.matchedAddress || result.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Census Tract GEOID:</label>
                <p className="text-gray-900 dark:text-gray-100 font-mono">{result.geoid}</p>
              </div>

              {result.coordinates && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Coordinates:</label>
                  <p className="text-gray-900 dark:text-gray-100 font-mono">
                    {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {result.censusData && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Census Information:</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    State: {result.censusData.state} | County: {result.censusData.county} | Tract: {result.censusData.tract}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {result.isInOZ && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Consult with a qualified tax professional about OZ benefits</li>
                  <li>• Consider establishing or investing through a Qualified Opportunity Fund</li>
                  <li>• Verify current OZ designation status before proceeding</li>
                  <li>• Review compliance requirements for OZ investments</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About Opportunity Zones</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Opportunity Zones are economically distressed communities where new investments may be 
            eligible for preferential tax treatment. This tool checks if your development address 
            falls within a designated Opportunity Zone census tract using official US Census data.
          </p>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Data includes {ozChecker.getStats().totalOZTracts || '8,765'} Opportunity Zone census tracts across all US states and territories.</p>
            <p>This tool is for informational purposes only. Always verify with official sources and consult tax professionals.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 