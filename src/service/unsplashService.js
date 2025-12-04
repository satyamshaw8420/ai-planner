// Unsplash API Service
const UNSPLASH_ACCESS_KEY = '-SM0favOiLSKdFiD9cMc58LkLseqUZLcTeohV3qLW_w';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Simple in-memory cache for images
const imageCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Fetch images from Unsplash based on a search query
 * @param {string} query - Search query for images
 * @param {number} perPage - Number of images to fetch (default: 10)
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchUnsplashImages = async (query, perPage = 10) => {
  // Check cache first
  const cacheKey = `${query}-${perPage}`;
  const cachedResult = imageCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data;
  }
  
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const images = data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        alt: photo.alt_description || query,
        photographer: photo.user?.name || 'Unknown',
        photographerUrl: photo.user?.links?.html || '#'
      }));
      
      // Cache the result
      imageCache.set(cacheKey, {
        data: images,
        timestamp: Date.now()
      });
      
      return images;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch a single high-quality image for a specific destination
 * @param {string} destination - Destination name
 * @returns {Promise<Object|null>} Image object or null if not found
 */
export const fetchDestinationImage = async (destination) => {
  // Check cache first
  const cacheKey = `destination-${destination}`;
  const cachedResult = imageCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data;
  }
  
  try {
    const images = await fetchUnsplashImages(destination, 1);
    const image = images.length > 0 ? images[0] : null;
    
    // Cache the result
    if (image) {
      imageCache.set(cacheKey, {
        data: image,
        timestamp: Date.now()
      });
    }
    
    return image;
  } catch (error) {
    console.error(`Error fetching image for destination ${destination}:`, error);
    return null;
  }
};

/**
 * Fetch multiple images for a trip itinerary
 * @param {string} destination - Destination name
 * @param {number} count - Number of images to fetch
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchTripImages = async (destination, count = 5) => {
  // Check cache first
  const cacheKey = `trip-${destination}-${count}`;
  const cachedResult = imageCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.data;
  }
  
  try {
    // Try destination-specific images first
    let images = await fetchUnsplashImages(`${destination} travel`, count);
    
    // If not enough, try general travel images
    if (images.length < count) {
      const additionalImages = await fetchUnsplashImages('travel destination', count - images.length);
      images = [...images, ...additionalImages];
    }
    
    // Cache the result
    imageCache.set(cacheKey, {
      data: images,
      timestamp: Date.now()
    });
    
    return images;
  } catch (error) {
    console.error(`Error fetching trip images for ${destination}:`, error);
    return [];
  }
};

export default {
  fetchUnsplashImages,
  fetchDestinationImage,
  fetchTripImages
};