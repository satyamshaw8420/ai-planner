// Hotel Service using OpenStreetMap and Overpass API
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetch hotels from OpenStreetMap based on location
 * @param {string} location - Location name or coordinates
 * @param {number} limit - Number of hotels to fetch (default: 10)
 * @returns {Promise<Array>} Array of hotel objects
 */
export const fetchHotelsFromOSM = async (location, limit = 10) => {
  try {
    // First, we need to geocode the location to get coordinates
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
    );
    
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding API error: ${geocodeResponse.status}`);
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      console.warn(`No coordinates found for location: ${location}`);
      return [];
    }
    
    const { lat, lon } = geocodeData[0];
    
    // Create Overpass QL query to find hotels near the location
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](around:5000,${lat},${lon});
        way["tourism"="hotel"](around:5000,${lat},${lon});
        relation["tourism"="hotel"](around:5000,${lat},${lon});
        node["amenity"="hotel"](around:5000,${lat},${lon});
        way["amenity"="hotel"](around:5000,${lat},${lon});
        relation["amenity"="hotel"](around:5000,${lat},${lon});
      );
      out center;
    `;
    
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      console.warn(`No hotels found near ${location}`);
      return [];
    }
    
    // Process the results
    const hotels = data.elements.slice(0, limit).map(element => {
      const tags = element.tags || {};
      
      // Get name, fallback to id if no name
      const name = tags.name || tags['addr:housename'] || `Hotel ${element.id}`;
      
      // Get address components
      const address = [
        tags['addr:street'],
        tags['addr:housenumber'],
        tags['addr:city'],
        tags['addr:postcode']
      ].filter(Boolean).join(', ');
      
      // Get coordinates
      let latitude, longitude;
      if (element.type === 'node') {
        latitude = element.lat;
        longitude = element.lon;
      } else if (element.center) {
        latitude = element.center.lat;
        longitude = element.center.lon;
      }
      
      return {
        id: element.id,
        name: name,
        address: address || 'Address not available',
        latitude: latitude,
        longitude: longitude,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        stars: tags.stars || null,
        rooms: tags.rooms || null,
        description: tags.description || 'Hotel information not available'
      };
    });
    
    return hotels;
  } catch (error) {
    console.error('Error fetching hotels from OpenStreetMap:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch a single high-quality hotel for a specific location
 * @param {string} location - Location name
 * @returns {Promise<Object|null>} Hotel object or null if not found
 */
export const fetchDestinationHotel = async (location) => {
  try {
    const hotels = await fetchHotelsFromOSM(location, 1);
    return hotels.length > 0 ? hotels[0] : null;
  } catch (error) {
    console.error(`Error fetching hotel for location ${location}:`, error);
    return null;
  }
};

/**
 * Fetch multiple hotels for a trip itinerary
 * @param {string} location - Location name
 * @param {number} count - Number of hotels to fetch
 * @returns {Promise<Array>} Array of hotel objects
 */
export const fetchTripHotels = async (location, count = 5) => {
  try {
    const hotels = await fetchHotelsFromOSM(location, count);
    return hotels;
  } catch (error) {
    console.error(`Error fetching hotels for ${location}:`, error);
    return [];
  }
};

export default {
  fetchHotelsFromOSM,
  fetchDestinationHotel,
  fetchTripHotels
};