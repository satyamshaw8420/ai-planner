// Hotel API service for fetching real-time hotel ratings and pricing
// This service integrates with RapidAPI Booking.com Content API to enhance hotel data in trips
import { searchHotelPhotos } from './photoApi';

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
 * Search hotels by location using RapidAPI Booking.com Content API
 * @param {string} location - Location name or coordinates
 * @returns {Promise<Object>} Search results
 */
export async function searchHotels(location) {
  try {
    // Encode the location for URL
    const encodedLocation = encodeURIComponent(location);
    
    // RapidAPI Booking.com Content API endpoint for searching locations
    const url = `https://booking-com.p.rapidapi.com/v1/hotels/locations?locale=en-gb&name=${encodedLocation}`;
    
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // Add timeout and proper headers for RapidAPI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    // Return null to indicate failure without breaking the app
    return null;
  }
}

/**
 * Get hotel details using RapidAPI Booking.com Content API
 * @param {string} hotelId - Hotel ID
 * @returns {Promise<Object>} Hotel details data
 */
export async function getHotelDetails(hotelId) {
  try {
    // RapidAPI Booking.com Content API endpoint for hotel details
    const url = `https://booking-com.p.rapidapi.com/v1/hotels/data?hotel_ids=${hotelId}&locale=en-gb`;
    
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // Add timeout and proper headers for RapidAPI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    });
  } catch (error) {
    console.error('Error getting hotel details:', error);
    // Return null to indicate failure without breaking the app
    return null;
  }
}

/**
 * Get hotel pricing using RapidAPI Booking.com Content API
 * @param {string} hotelId - Hotel ID
 * @param {string} checkinDate - Check-in date (YYYY-MM-DD)
 * @param {string} checkoutDate - Check-out date (YYYY-MM-DD)
 * @param {number} adults - Number of adults (default: 2)
 * @param {number} roomQuantity - Number of rooms (default: 1)
 * @returns {Promise<Object>} Hotel pricing data
 */
export async function getHotelPricing(hotelId, checkinDate, checkoutDate, adults = 2, roomQuantity = 1) {
  try {
    // RapidAPI Booking.com Content API endpoint for hotel pricing
    const url = `https://booking-com.p.rapidapi.com/v1/hotels/prices?hotel_ids=${hotelId}&checkin_date=${checkinDate}&checkout_date=${checkoutDate}&adults_number=${adults}&room_quantity=${roomQuantity}&locale=en-gb&currency_code=USD`;
    
    // Use retry mechanism with exponential backoff
    return await retryWithBackoff(async () => {
      // Add timeout and proper headers for RapidAPI
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    });
  } catch (error) {
    console.error('Error getting hotel pricing:', error);
    // Return null to indicate failure without breaking the app
    return null;
  }
}

/**
 * Enhance existing hotel data with real-time ratings and pricing
 * This function tries to find matching hotels in the hotel database
 * and enrich the existing hotel data with real-time information
 * @param {Array} hotels - Array of hotel objects from the trip data
 * @param {string} location - Location name for searching hotels
 * @returns {Promise<Array>} Enhanced hotel data
 */
export async function enhanceHotelData(hotels, location) {
  // If no hotels or location, return original data
  if (!hotels || !hotels.length || !location) {
    return hotels || [];
  }
  
  try {
    // First, try to search for hotels in the location
    const searchResults = await searchHotels(location);
    
    // If search failed, return original data
    if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
      console.warn('Hotel search failed, returning original data');
      return hotels;
    }
    
    // Take the first 5 results for processing
    const topResults = searchResults.slice(0, 5);
    
    // Create a map of hotel names to search results for easier matching
    const hotelMap = {};
    topResults.forEach(result => {
      // For location results, we need to extract hotel information
      if (result.dest_type === 'hotel') {
        // Normalize hotel name for matching (lowercase, remove extra spaces)
        const normalizedName = result.name ? result.name.toLowerCase().trim() : '';
        hotelMap[normalizedName] = result;
      }
    });
    
    // Enhance each hotel with real-time data if available
    const enhancedHotels = await Promise.all(hotels.map(async (hotel) => {
      // Try to find matching hotel in search results
      const hotelName = hotel.hotelName || hotel.name || '';
      const normalizedName = hotelName.toLowerCase().trim();
      
      // Look for exact match first
      let matchedHotel = hotelMap[normalizedName];
      
      // If no exact match, try partial matches
      if (!matchedHotel) {
        const hotelNames = Object.keys(hotelMap);
        for (const name of hotelNames) {
          if (normalizedName.includes(name) || name.includes(normalizedName)) {
            matchedHotel = hotelMap[name];
            break;
          }
        }
      }
      
      // If we found a match, enhance the hotel data
      if (matchedHotel && matchedHotel.dest_id) {
        try {
          // Get hotel details
          const hotelDetails = await getHotelDetails(matchedHotel.dest_id);
          
          // Get today's date and tomorrow's date for pricing
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const checkinDate = today.toISOString().split('T')[0];
          const checkoutDate = tomorrow.toISOString().split('T')[0];
          
          // Get hotel pricing
          const pricing = await getHotelPricing(matchedHotel.dest_id, checkinDate, checkoutDate);
          
          // Extract price information if available
          let priceInfo = null;
          let rating = hotel.rating || 4.0; // Default rating if not provided
          
          if (pricing && pricing[matchedHotel.dest_id]) {
            const hotelPricing = pricing[matchedHotel.dest_id];
            // Get the lowest price if available
            if (hotelPricing.gross_prices && hotelPricing.gross_prices.length > 0) {
              const prices = hotelPricing.gross_prices.map(p => p.amount);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              
              priceInfo = {
                min: minPrice,
                max: maxPrice,
                currency: hotelPricing.gross_prices[0].currency
              };
            }
          }
          
          // Extract rating from hotel details if available
          if (hotelDetails && hotelDetails[0] && hotelDetails[0].review_score) {
            rating = hotelDetails[0].review_score;
          }
          
          // Extract image URL if available
          let imageUrl = hotel.hotelImageUrl;
          if (hotelDetails && hotelDetails[0] && hotelDetails[0].url) {
            // In a real implementation, we would extract the image URL from the hotel details
            // For now, we'll use our photo API to get relevant hotel images
            imageUrl = hotel.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
          } else {
            // If we don't have hotel details, try to get images using our photo API
            try {
              const hotelName = hotel.hotelName || hotel.name || 'hotel';
              const hotelPhotos = await searchHotelPhotos(hotelName, location, 1);
              if (hotelPhotos && hotelPhotos.length > 0) {
                imageUrl = hotelPhotos[0].url;
              }
            } catch (photoError) {
              console.warn('Error fetching hotel photos:', photoError);
              // Fall back to placeholder
              imageUrl = hotel.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
            }
          }
          
          // Extract address if available
          let address = hotel.hotelAddress;
          if (hotelDetails && hotelDetails[0] && hotelDetails[0].address) {
            address = hotelDetails[0].address;
          }
          
          // Extract description if available
          let description = hotel.description;
          if (hotelDetails && hotelDetails[0] && hotelDetails[0].description) {
            description = hotelDetails[0].description;
          }
          
          return {
            ...hotel,
            // Add real-time data if available
            realTimeRating: rating,
            realTimePriceRange: priceInfo,
            hotelKey: matchedHotel.dest_id, // Store hotel key for future API calls
            hotelImageUrl: imageUrl,
            hotelAddress: address,
            description: description,
            enhanced: true // Flag to indicate this hotel has been enhanced
          };
        } catch (detailError) {
          console.error('Error getting hotel details or pricing:', detailError);
          // Return hotel with partial enhancement
          return {
            ...hotel,
            enhanced: false
          };
        }
      }
      
      // If no match found, return original hotel data
      return hotel;
    }));
    
    return enhancedHotels;
  } catch (error) {
    console.error('Error enhancing hotel data:', error);
    // Return original data if enhancement fails
    return hotels;
  }
}

export default {
  searchHotels,
  getHotelDetails,
  getHotelPricing,
  enhanceHotelData
};