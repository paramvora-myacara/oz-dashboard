// Utility for checking if a location is in an Opportunity Zone
// This combines the US Census geocoding API with our GEOID lookup table

class OZChecker {
  constructor() {
    this.ozGeoids = null;
    this.ozSet = null;
    this.loading = false;
  }

  /**
   * Initialize the OZ checker by loading the GEOID lookup data
   */
  async initialize() {
    if (this.ozSet) return; // Already initialized
    
    if (this.loading) {
      // Wait for existing load to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      this.loading = true;
      console.log('Loading OZ GEOID lookup data...');
      
      const response = await fetch('/data/oz-geoid-minimal.json');
      if (!response.ok) {
        throw new Error(`Failed to load OZ data: ${response.status}`);
      }
      
      const data = await response.json();
      this.ozGeoids = data.geoids;
      this.ozSet = new Set(data.geoids);
      
      console.log(`Loaded ${data.geoids.length} OZ GEOIDs for lookup`);
    } catch (error) {
      console.error('Failed to initialize OZ checker:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Check if a GEOID is in an Opportunity Zone
   * @param {string} geoid - The 11-digit census tract GEOID
   * @returns {boolean} - True if the GEOID is in an OZ
   */
  isOZ(geoid) {
    if (!this.ozSet) {
      throw new Error('OZ checker not initialized. Call initialize() first.');
    }
    return this.ozSet.has(geoid);
  }

  /**
   * Geocode an address using the US Census geocoding API
   * @param {string} address - The address to geocode
   * @returns {Promise<Object>} - Geocoding result with coordinates and GEOID
   */
  async geocodeAddress(address) {
    try {
      console.log(`Geocoding address: ${address}`);
      
      // Use our API route that proxies to Census geocoder
      const response = await fetch('/api/census-geocoder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Geocoding failed');
      }

      return result.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Check if an address is in an Opportunity Zone
   * @param {string} address - The address to check
   * @returns {Promise<Object>} - Result object with OZ status and details
   */
  async checkAddress(address) {
    try {
      // Ensure OZ data is loaded
      await this.initialize();

      // Geocode the address
      const geocodeResult = await this.geocodeAddress(address);
      
      if (!geocodeResult.geoid) {
        return {
          success: false,
          error: 'Could not determine census tract for this address',
          address: address
        };
      }

      // Check if the GEOID is in an OZ
      const isInOZ = this.isOZ(geocodeResult.geoid);

      return {
        success: true,
        address: address,
        coordinates: {
          lat: geocodeResult.lat,
          lng: geocodeResult.lng
        },
        geoid: geocodeResult.geoid,
        isOpportunityZone: isInOZ,
        censusData: {
          state: geocodeResult.state,
          county: geocodeResult.county,
          tract: geocodeResult.tract,
          block: geocodeResult.block
        },
        matchedAddress: geocodeResult.matchedAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        address: address
      };
    }
  }

  /**
   * Check if coordinates are in an Opportunity Zone
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude  
   * @returns {Promise<Object>} - Result object with OZ status and details
   */
  async checkCoordinates(lat, lng) {
    try {
      // Ensure OZ data is loaded
      await this.initialize();

      console.log(`Checking coordinates: ${lat}, ${lng}`);
      
      // Use reverse geocoding through our API
      const response = await fetch('/api/census-geocoder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          lat: lat, 
          lng: lng,
          reverseGeocode: true 
        })
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Reverse geocoding failed');
      }

      const geocodeResult = result.data;
      
      if (!geocodeResult.geoid) {
        return {
          success: false,
          error: 'Could not determine census tract for these coordinates',
          coordinates: { lat, lng }
        };
      }

      // Check if the GEOID is in an OZ
      const isInOZ = this.isOZ(geocodeResult.geoid);

      return {
        success: true,
        coordinates: { lat, lng },
        geoid: geocodeResult.geoid,
        isOpportunityZone: isInOZ,
        censusData: {
          state: geocodeResult.state,
          county: geocodeResult.county,
          tract: geocodeResult.tract,
          block: geocodeResult.block
        },
        matchedAddress: geocodeResult.matchedAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        coordinates: { lat, lng }
      };
    }
  }

  /**
   * Get statistics about the loaded OZ data
   * @returns {Object} - Statistics about the OZ dataset
   */
  getStats() {
    if (!this.ozGeoids) {
      return { error: 'OZ data not loaded' };
    }

    return {
      totalOZTracts: this.ozGeoids.length,
      loaded: true,
      sampleGeoids: this.ozGeoids.slice(0, 5)
    };
  }
}

// Create a singleton instance
const ozChecker = new OZChecker();

export default ozChecker;

// Named exports for convenience
export const checkAddress = (address) => ozChecker.checkAddress(address);
export const checkCoordinates = (lat, lng) => ozChecker.checkCoordinates(lat, lng);
export const isOZ = (geoid) => ozChecker.isOZ(geoid);
export const initializeOZChecker = () => ozChecker.initialize(); 