'use client';

import { useState, useEffect, useRef } from 'react';

export const useAddressPredictions = () => {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef(null);
  const predictionsRef = useRef(null);

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

  const resetForm = () => {
    setInputValue('');
    setSelectedAddress('');
    setPredictions([]);
    setShowPredictions(false);
  };

  return {
    inputValue,
    setInputValue,
    predictions,
    selectedAddress,
    setSelectedAddress,
    showPredictions,
    selectPrediction,
    resetForm,
    inputRef,
    predictionsRef
  };
}; 