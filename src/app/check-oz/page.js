'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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
    <div className="min-h-screen bg-white dark:bg-black px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            Check if Your Development is in an Opportunity Zone
          </h1>
          <p className="text-xl text-black/60 dark:text-white/60 font-light">
            Enter your development address to see if it qualifies for Opportunity Zone benefits
          </p>
          {!ozDataLoaded && (
            <div className="mt-6 text-sm text-[#0071e3] animate-pulse">
              Loading OZ data... ({ozChecker.getStats().totalOZTracts || '8,765'} census tracts)
            </div>
          )}
        </div>

        {/* Address Input */}
        <div className="glass-card rounded-3xl p-8 mb-8 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 hover:scale-[1.005] transition-all duration-300 animate-fadeIn">
          <label htmlFor="address-input" className="block text-lg font-medium text-black dark:text-white mb-4">
            Development Address
          </label>
          
          <div className="relative mb-6">
            <input
              ref={inputRef}
              id="address-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter street address (e.g., 123 Main Street, Tampa, FL)..."
              className="w-full px-6 py-4 pr-14 border border-black/20 dark:border-white/20 rounded-2xl focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3] bg-white/90 dark:bg-black/30 text-black dark:text-white text-lg placeholder-black/40 dark:placeholder-white/40 transition-all backdrop-blur-sm"
              disabled={isLoading}
            />

            {/* Clear button */}
            {(inputValue || selectedAddress) && (
              <button
                onClick={resetForm}
                disabled={isLoading}
                className="absolute right-4 top-4 bottom-4 flex items-center justify-center w-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 disabled:cursor-not-allowed"
                title="Clear address"
              >
                <X className="w-4 h-4 text-black/60 dark:text-white/60" />
              </button>
            )}

            {/* Address format hint */}
            <p className="mt-3 text-sm text-black/60 dark:text-white/60 font-light">
              💡 Tip: Use street addresses with numbers (not business/building names) for best results
            </p>

            {/* Predictions Dropdown */}
            {showPredictions && predictions.length > 0 && (
              <div 
                ref={predictionsRef}
                className="absolute z-10 w-full mt-2 glass-card bg-white/95 dark:bg-black/90 border border-black/20 dark:border-white/20 rounded-2xl shadow-2xl max-h-64 overflow-y-auto backdrop-blur-xl"
              >
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.placeId}
                    onClick={() => selectPrediction(prediction)}
                    className="w-full px-6 py-4 text-left hover:bg-black/5 dark:hover:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10 focus:outline-none text-black dark:text-white first:rounded-t-2xl last:rounded-b-2xl transition-all duration-200"
                  >
                    {prediction.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={checkOZStatus}
              disabled={isLoading || !selectedAddress || !ozDataLoaded}
              className="flex-1 bg-[#0071e3] hover:bg-[#0071e3]/90 disabled:bg-black/20 dark:disabled:bg-white/20 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:text-black/40 dark:disabled:text-white/40 text-lg"
            >
              {isLoading ? 'Checking...' : 'Check OZ Status'}
            </button>
            
            <button
              onClick={checkCurrentLocation}
              disabled={isLoading || !ozDataLoaded}
              className="bg-[#30d158] hover:bg-[#30d158]/90 disabled:bg-black/20 dark:disabled:bg-white/20 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:text-black/40 dark:disabled:text-white/40 text-lg"
            >
              Use My Location
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card rounded-3xl p-6 mb-8 bg-[#ff375f]/5 border border-[#ff375f]/20 animate-fadeIn">
            <div className="flex items-start">
              <div className="text-[#ff375f] mt-1 mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-[#ff375f] font-medium">
                {error.split('\n').map((line, index) => (
                  <div key={index} className={index > 0 ? 'mt-2' : ''}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`glass-card rounded-3xl p-8 mb-8 animate-fadeIn ${
            result.isInOZ 
              ? 'bg-[#30d158]/5 border border-[#30d158]/20' 
              : 'bg-[#ff9500]/5 border border-[#ff9500]/20'
          }`}>
            <div className="flex items-center mb-6">
              <div className={`text-3xl mr-4 ${result.isInOZ ? 'text-[#30d158]' : 'text-[#ff9500]'}`}>
                {result.isInOZ ? '✅' : '❌'}
              </div>
              <div>
                <h3 className={`text-2xl font-semibold ${result.isInOZ ? 'text-[#30d158]' : 'text-[#ff9500]'} mb-1`}>
                  {result.isInOZ ? 'Opportunity Zone Qualified!' : 'Not in an Opportunity Zone'}
                </h3>
                <p className={`text-lg ${result.isInOZ ? 'text-[#30d158]/80' : 'text-[#ff9500]/80'} font-light`}>
                  {result.isInOZ 
                    ? 'This development may qualify for Opportunity Zone tax benefits' 
                    : 'This location does not qualify for Opportunity Zone benefits'
                  }
                </p>
              </div>
            </div>

            {/* Result Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-black/60 dark:text-white/60 block mb-1">Address:</label>
                <p className="text-black dark:text-white font-light text-lg">{result.matchedAddress || result.address}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-black/60 dark:text-white/60 block mb-1">Census Tract GEOID:</label>
                <p className="text-black dark:text-white font-mono text-lg">{result.geoid}</p>
              </div>

              {result.coordinates && (
                <div>
                  <label className="text-sm font-medium text-black/60 dark:text-white/60 block mb-1">Coordinates:</label>
                  <p className="text-black dark:text-white font-mono text-lg">
                    {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {result.censusData && (
                <div>
                  <label className="text-sm font-medium text-black/60 dark:text-white/60 block mb-1">Census Information:</label>
                  <p className="text-black dark:text-white font-light text-lg">
                    State: {result.censusData.state} | County: {result.censusData.county} | Tract: {result.censusData.tract}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {result.isInOZ && (
              <div className="mt-8 glass-card p-6 bg-[#0071e3]/5 rounded-2xl border border-[#0071e3]/20">
                <h4 className="font-semibold text-[#0071e3] mb-4 text-lg">Next Steps:</h4>
                <ul className="text-black/80 dark:text-white/80 space-y-2 font-light">
                  <li>• Consult with a qualified tax professional about OZ benefits</li>
                  <li>• Consider establishing or investing through a Qualified Opportunity Fund</li>
                  <li>• Verify current OZ designation status before proceeding</li>
                  <li>• Review compliance requirements for OZ investments</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 