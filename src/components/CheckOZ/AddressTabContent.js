'use client';

import { X } from 'lucide-react';

const AddressTabContent = ({ 
  inputValue, 
  setInputValue, 
  selectedAddress, 
  setSelectedAddress,
  predictions, 
  showPredictions, 
  selectPrediction, 
  resetForm, 
  checkOZStatus, 
  isLoading, 
  ozDataLoaded,
  inputRef,
  predictionsRef 
}) => (
  <div className="glass-card rounded-3xl p-8 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 hover:scale-[1.005] transition-all duration-300 animate-fadeIn">
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

    {/* Check Address Button */}
    <button
      onClick={checkOZStatus}
      disabled={isLoading || !selectedAddress || !ozDataLoaded}
      className="w-full bg-[#0071e3] hover:bg-[#0071e3]/90 disabled:bg-black/20 dark:disabled:bg-white/20 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:text-black/40 dark:disabled:text-white/40 text-lg"
    >
      {isLoading ? 'Checking...' : 'Check OZ Status'}
    </button>
  </div>
);

export default AddressTabContent; 