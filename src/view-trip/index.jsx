import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '../components/ui/button';
import { enhanceHotelData } from '../service/hotelApi'; // Import our new hotel API service
import { toast } from 'sonner';
import { searchPlacePhotos } from '../service/photoApi'; // Import our new photo API service

const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = useQuery(api.tripsQueries.getTripById, { id: id });
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [enhancedHotels, setEnhancedHotels] = useState([]); // State for enhanced hotel data
  const [isEnhancing, setIsEnhancing] = useState(false); // State to track enhancement process
  
  // States for data processing
  const [parsedTripData, setParsedTripData] = useState(null);
  const [error, setError] = useState(null);
  
  // Process trip data when it changes
  useEffect(() => {
    if (!trip) {
      setIsLoading(true);
      return;
    }
    
    try {
      setIsLoading(false);
      
      // Extract trip data
      const { tripData, userSelection, createdAt } = trip;
      
      // Debug: Log the raw trip data to see its structure
      console.log('Raw trip data:', trip);
      console.log('Trip Data (raw):', tripData);
      
      // Parse the trip data if it's a string
      let parsedData = tripData;
      if (typeof tripData === 'string') {
        try {
          // Try to parse as JSON
          parsedData = JSON.parse(tripData);
          console.log('Parsed trip data:', parsedData);
        } catch (e) {
          // If parsing fails, try to extract JSON from the string
          console.log("Failed to parse trip data as JSON, attempting to extract JSON");
          const jsonStart = tripData.indexOf('{');
          const jsonEnd = tripData.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            try {
              const jsonString = tripData.substring(jsonStart, jsonEnd + 1);
              parsedData = JSON.parse(jsonString);
              console.log('Extracted and parsed trip data:', parsedData);
            } catch (extractError) {
              console.log("Failed to extract and parse JSON from trip data");
              // Try to parse as a more relaxed JSON (sometimes AI adds extra commas or formatting issues)
              try {
                // Attempt to fix common JSON issues
                let fixedJsonString = tripData.substring(jsonStart, jsonEnd + 1);
                // Fix trailing commas
                fixedJsonString = fixedJsonString.replace(/,\s*([}\]])/g, '$1');
                // Fix single quotes to double quotes (be careful not to mess up strings)
                // This is a simple approach and might not work for all cases
                parsedData = JSON.parse(fixedJsonString);
                console.log('Fixed and parsed trip data:', parsedData);
              } catch (fixError) {
                console.log("Failed to fix and parse JSON from trip data");
                // Keep it as a string
              }
            }
          }
        }
      }
      
      // Normalize itinerary data structure
      const normalizeItinerary = (data) => {
        if (!data) return data;
        
        // If data has an itinerary property, use that
        if (data.itinerary) {
          return data;
        }
        
        // Check if data itself looks like an itinerary (has day-like keys)
        const keys = Object.keys(data);
        const dayKeys = keys.filter(key => key.toLowerCase().includes('day'));
        
        if (dayKeys.length > 0) {
          return { itinerary: data };
        }
        
        // If we have a flat structure with day1, day2, etc. at the top level
        return data;
      };
      
      // Apply normalization
      parsedData = normalizeItinerary(parsedData);
      setParsedTripData(parsedData);
    } catch (err) {
      console.error('Error processing trip data:', err);
      setError('Failed to process trip data');
    }
  }, [trip]);
  
  // Function to convert currency to Indian Rupees
  const convertToINR = (priceString) => {
    if (!priceString) return null;
    
    // Extract numeric value and currency symbol
    const euroMatch = priceString.match(/€(\d+(?:\.\d+)?)/);
    const dollarMatch = priceString.match(/\$(\d+(?:\.\d+)?)/);
    const inrMatch = priceString.match(/₹(\d+(?:\.\d+)?)/);
    
    // If already in INR, return as is
    if (inrMatch) return priceString;
    
    // Conversion rates (approximate)
    const euroToINRRate = 88; // 1 EUR ≈ 88 INR
    const dollarToINRRate = 83; // 1 USD ≈ 83 INR
    
    let amount, rate;
    
    if (euroMatch) {
      amount = parseFloat(euroMatch[1]);
      rate = euroToINRRate;
    } else if (dollarMatch) {
      amount = parseFloat(dollarMatch[1]);
      rate = dollarToINRRate;
    } else {
      // Try to extract any numeric value
      const numericMatch = priceString.match(/(\d+(?:\.\d+)?)/);
      if (numericMatch) {
        amount = parseFloat(numericMatch[1]);
        // Assume it's in USD if no currency symbol
        rate = dollarToINRRate;
      } else {
        return priceString; // Return original if no numeric value found
      }
    }
    
    const inrAmount = Math.round(amount * rate);
    return `₹${inrAmount.toLocaleString('en-IN')}`;
  };

  // Function to format the date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to render activity cards with improved styling
  const renderActivityCard = (activity, index) => {
    // Handle case where activity might be undefined or null
    if (!activity) {
      return (
        <div key={index} className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-200 hover:shadow-md transition-shadow">
          <p className="text-gray-700">Activity data not available</p>
        </div>
      );
    }
    
    // Handle case where activity might be a string
    if (typeof activity === 'string') {
      return (
        <div key={index} className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-200 hover:shadow-md transition-shadow">
          <p className="text-gray-700">{activity}</p>
        </div>
      );
    }
    
    return (
      <div key={index} className="bg-white rounded-xl shadow-sm p-5 mb-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Place Image */}
          <div className="md:w-1/3 h-48 rounded-xl overflow-hidden">
            <img 
              src={activity.placeImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'} 
              alt={activity.placeName || 'Place Image'}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
            />
          </div>
          
          {/* Activity Details */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.placeName || `Activity ${index + 1}`}</h3>
                <p className="text-gray-700 mb-3">{activity.placeDetails || 'No details available'}</p>
              </div>
              {activity.rating && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">{activity.rating}/5</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {activity.ticketPricing && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{convertToINR(activity.ticketPricing)}</span>
                </div>
              )}
              
              {activity.timeTravel && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{activity.timeTravel}</span>
                </div>
              )}
              
              {activity.bestTimeToVisit && (
                <div className="flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-gray-700">{activity.bestTimeToVisit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to extract place recommendations from trip data
  const extractPlaceRecommendations = (data) => {
    const places = [];
    
    // Helper function to recursively search for place data
    const searchForPlaces = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      // If this object looks like a place/activity
      if (obj.placeName || obj.placeDetails) {
        places.push(obj);
        return;
      }
      
      // Recursively search in arrays and objects
      if (Array.isArray(obj)) {
        obj.forEach(item => searchForPlaces(item));
      } else {
        Object.values(obj).forEach(value => searchForPlaces(value));
      }
    };
    
    searchForPlaces(data);
    return places;
  };

  // Function to render place recommendations
  const renderPlaceRecommendations = (places) => {
    if (!places || places.length === 0) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🌟 Place Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place, index) => renderActivityCard(place, index))}
        </div>
      </div>
    );
  };

  // Function to render time slot activities with improved styling
  const renderTimeSlot = (timeSlotData, index) => {
    // Handle case where timeSlotData might be undefined or null
    if (!timeSlotData) {
      return (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 bg-blue-50 p-3 rounded-lg">
            Time slot data not available
          </h3>
        </div>
      );
    }
    
    // Handle case where timeSlotData might be a string
    if (typeof timeSlotData === 'string') {
      return (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 bg-blue-50 p-3 rounded-lg">
            {timeSlotData}
          </h3>
        </div>
      );
    }
    
    return (
      <div key={index} className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg">
          {timeSlotData.timeSlot || `Time Slot ${index + 1}`}
        </h3>
        <div className="space-y-4">
          {timeSlotData.activities && Array.isArray(timeSlotData.activities) ? (
            timeSlotData.activities.map((activity, actIndex) => {
              return renderActivityCard(activity, actIndex);
            })
          ) : (
            <p>No activities available for this time slot</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render day plan with improved styling
  const renderDayPlan = (dayData, dayNumber) => {
    // Handle case where dayData might be undefined or null
    if (!dayData) {
      return (
        <div key={dayNumber} className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Day {dayNumber}</h2>
            <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              No data available
            </span>
          </div>
        </div>
      );
    }
    
    // Handle case where dayData might be a string
    if (typeof dayData === 'string') {
      return (
        <div key={dayNumber} className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Day {dayNumber}</h2>
          </div>
          <p>{dayData}</p>
        </div>
      );
    }
    
    return (
      <div key={dayNumber} className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Day {dayNumber}</h2>
          {dayData.date && (
            <span className="text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
              {dayData.date}
            </span>
          )}
        </div>
        
        {dayData.plan && Array.isArray(dayData.plan) ? (
          dayData.plan.map((timeSlot, index) => {
            return renderTimeSlot(timeSlot, index);
          })
        ) : (
          <p>No plan available for this day</p>
        )}
      </div>
    );
  };

  // Function to render hotel information with improved styling
  const renderHotels = (hotels) => {
    if (!hotels || hotels.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🏨 Recommended Hotels</h2>
          <button 
            onClick={enhanceHotels}
            disabled={isEnhancing}
            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors flex items-center"
          >
            {isEnhancing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enhancing...
              </>
            ) : (
              'Refresh Data'
            )}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(enhancedHotels.length > 0 ? enhancedHotels : hotels).map((hotel, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={hotel.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'} 
                  alt={hotel.hotelName || 'Hotel Image'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{hotel.hotelName || 'Hotel Name'}</h3>
                  <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold">
                      {hotel.enhanced && hotel.realTimeRating ? `${hotel.realTimeRating}/5` : (hotel.rating || 'N/A')}
                      {hotel.enhanced && <span className="text-xs ml-1">★</span>}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{hotel.hotelAddress || 'Address not available'}</p>
                <p className="text-gray-700 mb-4">{hotel.description || 'Description not available'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{convertToINR(hotel.price) || 'Price not available'}</span>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                      Book Now
                    </button>
                    {hotel.bookingUrl && (
                      <a 
                        href={hotel.bookingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        View Deal
                      </a>
                    )}
                  </div>
                </div>
                {hotel.enhanced && hotel.realTimePriceRange && (
                  <div className="mt-3 text-sm text-gray-500">
                    Real-time pricing: ₹{hotel.realTimePriceRange.min} - ₹{hotel.realTimePriceRange.max}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Function to render weather information
  const renderWeather = (weather) => {
    if (!weather) return null;

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-md p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">🌤️ Weather Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div key="current" className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Current</h3>
            <p className="text-3xl font-bold">{weather.current?.temp}°C</p>
            <p>{weather.current?.description}</p>
          </div>
          <div key="today" className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Today</h3>
            <p>High: {weather.forecast?.today?.high}°C</p>
            <p>Low: {weather.forecast?.today?.low}°C</p>
          </div>
          <div key="tomorrow" className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Tomorrow</h3>
            <p>High: {weather.forecast?.tomorrow?.high}°C</p>
            <p>Low: {weather.forecast?.tomorrow?.low}°C</p>
          </div>
        </div>
      </div>
    );
  };

  // Function to enhance hotel data with real-time information
  const enhanceHotels = async () => {
    if (trip?.tripData?.hotels && !isEnhancing) {
      setIsEnhancing(true);
      try {
        // Parse trip data if it's a string
        let parsedTripData = trip.tripData;
        if (typeof trip.tripData === 'string') {
          try {
            parsedTripData = JSON.parse(trip.tripData);
          } catch (e) {
            // If parsing fails, continue with original data
          }
        }
        
        const hotelsData = parsedTripData.hotels || trip.tripData.hotels || [];
        const locationLabel = trip.userSelection?.location?.label || '';
        
        if (hotelsData.length > 0 && locationLabel) {
          const enhanced = await enhanceHotelData(hotelsData, locationLabel);
          setEnhancedHotels(enhanced);
          if (enhanced.some(hotel => hotel.enhanced)) {
            toast.success('Hotel information enhanced with real-time data!');
          } else {
            toast.info('No additional hotel data found. Showing original information.');
          }
        }
      } catch (error) {
        console.error('Error enhancing hotels:', error);
        toast.error('Failed to enhance hotel information. Showing original data.');
      } finally {
        setIsEnhancing(false);
      }
    }
  };
  // Automatically try to enhance hotel data when component mounts
  useEffect(() => {
    if (trip && trip.tripData?.hotels && enhancedHotels.length === 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        enhanceHotels();
      }, 1000);
    }
  }, [trip, enhancedHotels]); // Dependency array ensures this runs when trip or enhancedHotels change

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your trip details...</p>
        </div>
      </div>
    );
  }

  // Show error state if trip not found
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Trip</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate('/create-trip')}>Create a New Trip</Button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the trip you're looking for.</p>
          <Button variant="outline" onClick={() => navigate('/create-trip')}>Create a New Trip</Button>
        </div>
      </div>
    );
  }

  // Extract trip data
  const { userSelection, createdAt } = trip;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">✈️ Your Travel Plan</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <span className="bg-blue-100 px-3 py-1 rounded-full">
                    📍 {userSelection?.location?.label}
                  </span>
                  <span className="bg-green-100 px-3 py-1 rounded-full">
                    📅 {userSelection?.days} Days
                  </span>
                  <span className="bg-purple-100 px-3 py-1 rounded-full">
                    👥 {userSelection?.travelers?.title || userSelection?.travelers} Travelers
                  </span>
                  <span className="bg-yellow-100 px-3 py-1 rounded-full">
                    💰 {userSelection?.budget?.title || userSelection?.budget}
                  </span>
                </div>
                {createdAt && (
                  <p className="mt-3 text-sm text-gray-500">
                    Generated on: {formatDate(createdAt)}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </div>
        </div>

        {/* Weather Section */}
        {parsedTripData?.weather && renderWeather(parsedTripData.weather)}

        {/* Place Recommendations Section */}
        {renderPlaceRecommendations(extractPlaceRecommendations(parsedTripData))}

        {/* Hotels Section */}
        {parsedTripData?.hotels && renderHotels(parsedTripData.hotels)}

        {/* Itinerary Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🗓️ Daily Itinerary</h2>

          {/* Handle different itinerary structures */}
          {parsedTripData?.itinerary ? (
            // If itinerary is an array
            Array.isArray(parsedTripData.itinerary) ? (
              parsedTripData.itinerary.map((day, index) => {
                return renderDayPlan(day, index + 1);
              })
            ) : (
              // If itinerary is an object with day keys
              Object.entries(parsedTripData.itinerary)
                .sort(([a], [b]) => {
                  // Sort day keys numerically (day1, day2, day10, etc.)
                  const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                  const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                  return numA - numB;
                })
                .map(([dayKey, dayData], index) => {
                  // Use the numeric part of the key for day numbering, fallback to index+1
                  const dayNumber = parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1);
                  return renderDayPlan(dayData, dayNumber);
                })
            )
          ) : (
            // Handle day1, day2, etc. format at top level
            Object.keys(parsedTripData || {})
              .filter(key => key.toLowerCase().startsWith('day'))
              .sort((a, b) => {
                // Sort day keys numerically (day1, day2, day10, etc.)
                const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
                return numA - numB;
              })
              .map((dayKey, index) => {
                const dayData = parsedTripData[dayKey];
                // Use the numeric part of the key for day numbering, fallback to index+1
                const dayNumber = parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1);
                return renderDayPlan(dayData, dayNumber);
              })
          )}
        </div>

        {/* Fallback for unknown structure */}
        {(!parsedTripData?.itinerary && 
          !parsedTripData?.day1 && 
          !parsedTripData?.Day1 && 
          !Object.keys(parsedTripData || {}).some(key => key.toLowerCase().includes('day'))) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Data Structure Analysis:</h3>
              <p>Type: {typeof parsedTripData}</p>
              <p>Keys: {typeof parsedTripData === 'object' ? Object.keys(parsedTripData || {}).join(', ') : 'N/A'}</p>
            </div>
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
              {typeof parsedTripData === 'string' 
                ? parsedTripData 
                : JSON.stringify(parsedTripData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTrip;