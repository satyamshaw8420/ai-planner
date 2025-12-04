// Simple test for OpenStreetMap hotel service
import { fetchTripHotels } from '../service/hotelService';

// Test the OpenStreetMap hotel service
const testOSMHotelService = async () => {
  try {
    console.log('Testing OpenStreetMap hotel service...');
    
    // Test fetching hotels for a known location
    console.log('Fetching hotels for Paris...');
    const parisHotels = await fetchTripHotels('Paris', 3);
    console.log('Hotels found in Paris:', parisHotels);
    
    // Test fetching hotels for another location
    console.log('Fetching hotels for London...');
    const londonHotels = await fetchTripHotels('London', 2);
    console.log('Hotels found in London:', londonHotels);
    
    // Test fetching hotels for a city with coordinates
    console.log('Fetching hotels for New York...');
    const nyHotels = await fetchTripHotels('New York', 2);
    console.log('Hotels found in New York:', nyHotels);
    
    console.log('OpenStreetMap hotel service test completed successfully!');
    console.log('Total hotels found:', parisHotels.length + londonHotels.length + nyHotels.length);
  } catch (error) {
    console.error('Error testing OpenStreetMap hotel service:', error);
  }
};

// Run the test
testOSMHotelService();

export default testOSMHotelService;