'use client';

const CoordinatesTabContent = ({ 
  latitude, 
  setLatitude, 
  longitude, 
  setLongitude, 
  checkCoordinates, 
  isLoading, 
  ozDataLoaded 
}) => (
  <div className="glass-card rounded-3xl p-8 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 hover:scale-[1.005] transition-all duration-300 animate-fadeIn">
    <label className="block text-lg font-medium text-black dark:text-white mb-4">
      Property Coordinates
    </label>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label htmlFor="latitude-input" className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">
          Latitude
        </label>
        <input
          id="latitude-input"
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="e.g., 27.9506"
          className="w-full px-6 py-4 border border-black/20 dark:border-white/20 rounded-2xl focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3] bg-white/90 dark:bg-black/30 text-black dark:text-white text-lg placeholder-black/40 dark:placeholder-white/40 transition-all backdrop-blur-sm"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="longitude-input" className="block text-sm font-medium text-black/60 dark:text-white/60 mb-2">
          Longitude
        </label>
        <input
          id="longitude-input"
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="e.g., -82.4572"
          className="w-full px-6 py-4 border border-black/20 dark:border-white/20 rounded-2xl focus:ring-2 focus:ring-[#0071e3] focus:border-[#0071e3] bg-white/90 dark:bg-black/30 text-black dark:text-white text-lg placeholder-black/40 dark:placeholder-white/40 transition-all backdrop-blur-sm"
          disabled={isLoading}
        />
      </div>
    </div>

    {/* Coordinates format hint */}
    <p className="mb-6 text-sm text-black/60 dark:text-white/60 font-light">
      💡 Tip: Use decimal degrees format. You can find coordinates from Google Maps, GPS devices, or surveyor reports
    </p>

    {/* Check Coordinates Button */}
    <button
      onClick={checkCoordinates}
      disabled={isLoading || !latitude || !longitude || !ozDataLoaded}
      className="w-full bg-[#0071e3] hover:bg-[#0071e3]/90 disabled:bg-black/20 dark:disabled:bg-white/20 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:text-black/40 dark:disabled:text-white/40 text-lg"
    >
      {isLoading ? 'Checking...' : 'Check OZ Status'}
    </button>
  </div>
);

export default CoordinatesTabContent; 