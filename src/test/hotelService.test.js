// Simple test for the hotel service
import { fetchHotelsFromOSM, fetchDestinationHotel, fetchTripHotels } from '../service/hotelService';

// Test the hotel service functions
const testHotelService = async () => {
  try {
    console.log('Testing OpenStreetMap hotel service...');
    
    // Test fetching hotels for a known location
    const hotels = await fetchTripHotels('Paris', 3);
    console.log('Hotels found in Paris:', hotels);
    
    // Test fetching a single hotel
    const hotel = await fetchDestinationHotel('London');
    console.log('Recommended hotel in London:', hotel);
    
    // Test fetching hotels with coordinates
    const hotelsWithCoords = await fetchHotelsFromOSM('New York', 2);
    console.log('Hotels found in New York:', hotelsWithCoords);
    
    console.log('Hotel service test completed successfully!');
  } catch (error) {
    console.error('Error testing hotel service:', error);
  }
};

// Run the test
testHotelService();