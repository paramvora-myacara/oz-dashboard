'use client';

import { useState, useEffect } from 'react';
import ozChecker, { checkAddress, initializeOZChecker } from '@/lib/ozChecker';
import { trackUserEvent } from '@/lib/events';

export const useOZChecker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [ozDataLoaded, setOzDataLoaded] = useState(false);

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

  const checkOZStatus = async (selectedAddress) => {
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
      trackUserEvent('oz_check_performed', '/check-oz', { type: 'address', address: selectedAddress });
      console.log('Checking address:', selectedAddress);
      
      // Use our new OZ checker utility
      const ozResult = await checkAddress(selectedAddress);

      if (ozResult.success) {
        trackUserEvent('oz_check_completed', '/check-oz', {
          type: 'address',
          address: selectedAddress,
          geoid: ozResult.geoid,
          isInOZ: ozResult.isOpportunityZone,
        });
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
          setError('Address not found. Building and landmark names don\'t work well. Please try a specific street address with number.\\n\\nFor example:\\n• "4202 E Fowler Ave, Tampa, FL" instead of "Marshall Student Center"\\n• "123 Main Street, Tampa, FL" instead of business names');
        } else if (ozResult.error.includes('No address match found')) {
          setError('Address not found. Please try:\\n• Including the full street address with number\\n• Verifying the address exists\\n• Using a different format (e.g., "123 Main St" vs "123 Main Street")\\n• Avoiding business names - use street addresses');
        } else if (ozResult.error.includes('timeout') || ozResult.error.includes('failed')) {
          setError('Service temporarily unavailable. Please try again in a moment.');
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

  const checkCoordinates = async (latitude, longitude) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude coordinates');
      return;
    }

    if (lat < 24 || lat > 49 || lng < -125 || lng > -66) {
      setError('Coordinates must be within the continental United States');
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
      trackUserEvent('oz_check_performed', '/check-oz', { type: 'coordinates', lat, lng });
      console.log('Checking coordinates:', lat, lng);
      
      // Import and use checkCoordinates function
      const { checkCoordinates } = await import('@/lib/ozChecker');
      const ozResult = await checkCoordinates(lat, lng);

      if (ozResult.success) {
        trackUserEvent('oz_check_completed', '/check-oz', {
          type: 'coordinates',
          lat,
          lng,
          geoid: ozResult.geoid,
          isInOZ: ozResult.isOpportunityZone,
        });
        setResult({
          isInOZ: ozResult.isOpportunityZone,
          geoid: ozResult.geoid,
          address: `Coordinates: ${lat}, ${lng}`,
          coordinates: ozResult.coordinates,
          censusData: ozResult.censusData,
          matchedAddress: ozResult.matchedAddress
        });
      } else {
        setError(ozResult.error || 'Unable to determine if these coordinates are in an Opportunity Zone');
      }
    } catch (error) {
      console.error('Error checking coordinates:', error);
      setError('An error occurred while checking the coordinates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError('');
  };

  return {
    isLoading,
    result,
    error,
    ozDataLoaded,
    checkOZStatus,
    checkCoordinates,
    resetForm
  };
};