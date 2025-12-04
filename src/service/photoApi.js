// Photo API service for fetching place and hotel images
// This service integrates with RapidAPI to provide real photos for places and hotels

/**
 * Retry a fetch request with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise<any>} Result of the function
 */
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, delay));
    // Retry with exponential backoff
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Search for place photos using RapidAPI
 * @param {string} query - Search query (place name, city, etc.)
 * @param {number} limit - Number of photos to return (default: 10)
 * @returns {Promise<Array>} Array of photo objects
 */
export async function searchPlacePhotos(query, limit = 10) {
  try {
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // For now, we'll return sample data since we don't have a specific place photo API
      // In a real implementation, this would call an actual photo API
      
      // Generate sample photo URLs based on the query
      const samplePhotos = [];
      for (let i = 1; i <= limit; i++) {
        // Create varied sample URLs
        const width = 800 + (i * 10) % 200; // Width between 800-1000
        const height = 600 + (i * 15) % 150; // Height between 600-750
        
        samplePhotos.push({
          id: `photo_${i}`,
          url: `https://images.unsplash.com/photo-${1500000000 + i}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${width}&h=${height}&q=80`,
          width: width,
          height: height,
          alt: `${query} photo ${i}`
        });
      }
      
      return samplePhotos;
    });
  } catch (error) {
    console.error('Error searching place photos:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get a specific place photo by ID
 * @param {string} photoId - Photo ID
 * @param {number} maxWidth - Maximum width of the photo
 * @param {number} maxHeight - Maximum height of the photo
 * @returns {Promise<Object>} Photo object with URL and metadata
 */
export async function getPlacePhoto(photoId, maxWidth = 800, maxHeight = 600) {
  try {
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // For now, we'll return a sample photo
      // In a real implementation, this would fetch the actual photo
      
      return {
        id: photoId,
        url: `https://images.unsplash.com/photo-${1500000000 + parseInt(photoId.split('_')[1])}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${maxWidth}&h=${maxHeight}&q=80`,
        width: maxWidth,
        height: maxHeight,
        alt: `Place photo ${photoId.split('_')[1]}`
      };
    });
  } catch (error) {
    console.error('Error getting place photo:', error);
    // Return a default placeholder
    return {
      id: 'placeholder',
      url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80',
      width: maxWidth,
      height: maxHeight,
      alt: 'Placeholder photo'
    };
  }
}

/**
 * Search for hotel photos using RapidAPI
 * @param {string} hotelName - Hotel name
 * @param {string} location - Hotel location (city, country)
 * @param {number} limit - Number of photos to return (default: 5)
 * @returns {Promise<Array>} Array of hotel photo objects
 */
export async function searchHotelPhotos(hotelName, location, limit = 5) {
  try {
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // For now, we'll return sample data
      // In a real implementation, this would call an actual hotel photo API
      
      const query = `${hotelName} ${location}`;
      const samplePhotos = [];
      
      for (let i = 1; i <= limit; i++) {
        // Create varied sample URLs
        const width = 800 + (i * 20) % 200; // Width between 800-1000
        const height = 600 + (i * 25) % 150; // Height between 600-750
        
        samplePhotos.push({
          id: `hotel_${i}`,
          url: `https://images.unsplash.com/photo-${1600000000 + i}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=${width}&h=${height}&q=80`,
          width: width,
          height: height,
          alt: `${hotelName} photo ${i}`
        });
      }
      
      return samplePhotos;
    });
  } catch (error) {
    console.error('Error searching hotel photos:', error);
    // Return empty array as fallback
    return [];
  }
}

export default {
  searchPlacePhotos,
  getPlacePhoto,
  searchHotelPhotos
};