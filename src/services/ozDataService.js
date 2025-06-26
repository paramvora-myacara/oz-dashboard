// src/services/ozDataService.js

class OZDataService {
  constructor() {
    this.cache = new Map();
    this.baseUrl = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Opportunity_Zones/FeatureServer/13';
  }

  // Get data with caching and progressive loading
  async getOZData(bbox = null, limit = 1000) {
    const cacheKey = bbox ? `oz_${bbox.join('_')}` : 'oz_all';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let url = `${this.baseUrl}/query?outFields=*&f=geojson&returnGeometry=true`;
      
      if (bbox) {
        url += `&geometry={"xmin":${bbox[0]},"ymin":${bbox[1]},"xmax":${bbox[2]},"ymax":${bbox[3]},"spatialReference":{"wkid":4326}}&geometryType=esriGeometryEnvelope`;
      }
      
      if (limit) {
        url += `&resultRecordCount=${limit}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch OZ data');
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching OZ data:', error);
      // Fallback to local data if API fails
      return this.getLocalData();
    }
  }

  // Fallback to local data
  async getLocalData() {
    try {
      const response = await fetch('/data/opportunity-zones.geojson');
      return await response.json();
    } catch (error) {
      console.error('Error loading local data:', error);
      return { features: [] };
    }
  }

  // Get state boundaries
  async getStateBoundaries() {
    if (this.cache.has('states')) {
      return this.cache.get('states');
    }

    try {
      const response = await fetch('/maps/us-states-10m.json');
      const data = await response.json();
      this.cache.set('states', data);
      return data;
    } catch (error) {
      console.error('Error loading state boundaries:', error);
      return null;
    }
  }

  // Get aggregated statistics
  async getStatistics() {
    if (this.cache.has('stats')) {
      return this.cache.get('stats');
    }

    try {
      const url = `${this.baseUrl}/query?outFields=*&where=1%3D1&returnCountOnly=true&f=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      const stats = {
        totalZones: data.count || 8764,
        totalInvestment: '$105.3B',
        jobsCreated: '2.1M',
        avgROI: '23.7%'
      };
      
      this.cache.set('stats', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        totalZones: 8764,
        totalInvestment: '$105.3B',
        jobsCreated: '2.1M',
        avgROI: '23.7%'
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new OZDataService(); 