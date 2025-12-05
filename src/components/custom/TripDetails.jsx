import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchTrip } from '@/hooks/useFetchTrip';
import { useShareTrip } from '@/hooks/useShareTrip';
import { toast } from 'sonner';
import { enhanceHotelData } from '@/service/hotelApi'; // Import our new hotel API service
import { searchPlacePhotos } from '@/service/photoApi'; // Import our new photo API service
// Import Unsplash service
import { fetchDestinationImage, fetchTripImages } from '@/service/unsplashService';
// Import OpenStreetMap hotel service
import { fetchTripHotels } from '@/service/hotelService';

const TripDetails = () => {
  const { id } = useParams();
  const { trip: tripData } = useFetchTrip(id);
  const { generateShareLink, copyToClipboard } = useShareTrip();
  const [isSharing, setIsSharing] = useState(false);
  const [enhancedHotels, setEnhancedHotels] = useState([]); // State for enhanced hotel data
  const [isEnhancing, setIsEnhancing] = useState(false); // State to track enhancement process
  const [destinationImage, setDestinationImage] = useState(null); // Store destination image
  const [tripImages, setTripImages] = useState([]); // Store trip images
  const [loadingImages, setLoadingImages] = useState(false); // Loading state for images
  
  // States for data processing
  const [parsedTripData, setParsedTripData] = useState(null);
  const [itineraryData, setItineraryData] = useState([]);
  const [hotelsData, setHotelsData] = useState([]);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch destination image when trip data changes
  useEffect(() => {
    const fetchImages = async () => {
      if (tripData && tripData.userSelection && tripData.userSelection.location) {
        setLoadingImages(true);
        try {
          // Fetch destination image
          const destImage = await fetchDestinationImage(tripData.userSelection.location.label);
          setDestinationImage(destImage);
          
          // Fetch additional trip images
          const images = await fetchTripImages(tripData.userSelection.location.label, 5);
          setTripImages(images);
        } catch (error) {
          console.error('Error fetching images:', error);
        } finally {
          setLoadingImages(false);
        }
      }
    };
    
    fetchImages();
  }, [tripData]);
  
  // Process trip data when it changes
  useEffect(() => {
    if (!tripData) {
      setIsLoading(true);
      return;
    }
    
    try {
      setIsLoading(false);
      
      // Show error state if trip not found
      if (!tripData._id) {
        setError('Trip not found');
        return;
      }
      
      // Debug: Log the raw trip data to see its structure
      console.log('Raw trip data in TripDetails:', tripData);
      console.log('Trip Data (raw):', tripData.tripData);
      
      // Parse the tripData if it's a string
      let parsedData = tripData.tripData;
      if (typeof tripData.tripData === 'string') {
        try {
          // Try to parse as JSON
          parsedData = JSON.parse(tripData.tripData);
          console.log('Parsed trip data:', parsedData);
        } catch (e) {
          // If parsing fails, try to extract JSON from the string
          console.log("Failed to parse trip data as JSON, attempting to extract JSON");
          const jsonStart = tripData.tripData.indexOf('{');
          const jsonEnd = tripData.tripData.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            try {
              const jsonString = tripData.tripData.substring(jsonStart, jsonEnd + 1);
              parsedData = JSON.parse(jsonString);
              console.log('Extracted and parsed trip data:', parsedData);
            } catch (extractError) {
              console.log("Failed to extract and parse JSON from trip data");
              // Try to parse as a more relaxed JSON (sometimes AI adds extra commas or formatting issues)
              try {
                // Attempt to fix common JSON issues
                let fixedJsonString = tripData.tripData.substring(jsonStart, jsonEnd + 1);
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
      
      // Handle different itinerary structures
      let itinerary = [];
      let hotels = [];
      let weather = null;
      
      // Extract weather info if present in the object
      if (parsedData?.weatherInfo) {
        weather = parsedData.weatherInfo;
      } else if (parsedData?.weather) {
        // Format weather data if stored as structured object
        weather = `**Current Weather in ${tripData.userSelection.location.label}:**
🌡️ ${parsedData.weather.temperature}°C, ${parsedData.weather.description}
💨 Humidity: ${parsedData.weather.humidity}%, Wind: ${parsedData.weather.windSpeed} m/s`;
      }
      
      setWeatherInfo(weather);
      
      // Extract hotels data
      if (parsedData?.hotels && Array.isArray(parsedData.hotels)) {
        hotels = parsedData.hotels;
      }
      
      // Check if itinerary is in the itinerary property
      if (parsedData?.itinerary) {
        // Check if itinerary is an array
        if (Array.isArray(parsedData.itinerary)) {
          itinerary = parsedData.itinerary;
        } 
        // Check if itinerary is an object with day keys
        else if (typeof parsedData.itinerary === 'object') {
          // Sort day keys numerically
          const sortedEntries = Object.entries(parsedData.itinerary)
            .sort(([a], [b]) => {
              const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
              const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
              return numA - numB;
            });
          
          itinerary = sortedEntries.map(([dayKey, dayData], index) => ({
            day: `Day ${parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1)}`,
            date: dayData.date || dayData.theme || `Day ${parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1)}`,
            plan: dayData.plan || dayData.places || dayData.activities || []
          }));
        }
      } else if (parsedData) {
        // Handle case where the entire parsedData is the itinerary object
        // Check if it has day keys at the top level
        const dayKeys = Object.keys(parsedData)
          .filter(key => key.toLowerCase().startsWith('day'))
          .sort((a, b) => {
            const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
          });
        
        if (dayKeys.length > 0) {
          itinerary = dayKeys.map((dayKey, index) => {
            const dayData = parsedData[dayKey];
            const dayNumber = parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1);
            return {
              day: `Day ${dayNumber}`,
              date: dayData.date || dayData.theme || `Day ${dayNumber}`,
              plan: dayData.plan || dayData.places || dayData.activities || []
            };
          });
          hotels = parsedData.hotels || hotels;
        }
      }
      
      console.log('Processed itinerary data:', itinerary);
      console.log('Processed hotels data:', hotels);
      
      setItineraryData(itinerary);
      setHotelsData(hotels);
    } catch (err) {
      console.error('Error processing trip data:', err);
      setError('Failed to process trip data');
    }
  }, [tripData]);
  
  // Function to enhance hotel data with real-time information
  const enhanceHotels = async () => {
    if (!isEnhancing && tripData && tripData.userSelection && tripData.userSelection.location) {
      setIsEnhancing(true);
      try {
        let enhanced = [];
        
        // Try to enhance existing hotels first
        if (hotelsData.length > 0) {
          enhanced = await enhanceHotelData(hotelsData, tripData.userSelection.location.label);
        }
        
        // Always fetch from OpenStreetMap as additional recommendations
        const osmHotels = await fetchTripHotels(tripData.userSelection.location.label, 5);
        if (osmHotels.length > 0) {
          // Convert OSM hotels to the expected format
          const formattedHotels = osmHotels.map(hotel => ({
            hotelName: hotel.name,
            hotelAddress: hotel.address,
            description: hotel.description,
            price: 'Price information not available',
            rating: hotel.stars || 'N/A',
            hotelImageUrl: null, // Will be filled with Unsplash image
            enhanced: true,
            osmData: true // Flag to indicate this is from OSM
          }));
          
          // Combine enhanced hotels with OSM hotels
          if (enhanced.length > 0) {
            // If we have enhanced hotels, add OSM hotels as additional recommendations
            enhanced = [...enhanced, ...formattedHotels];
          } else {
            // If no enhanced hotels, use OSM hotels as primary recommendations
            enhanced = formattedHotels;
          }
        }
        
        setEnhancedHotels(enhanced);
        
        if (enhanced.length > 0) {
          if (enhanced.some(hotel => hotel.enhanced && !hotel.osmData)) {
            toast.success('Hotel information enhanced with real-time data!');
          } else if (enhanced.some(hotel => hotel.osmData)) {
            toast.success('Hotel recommendations loaded from OpenStreetMap!');
          } else {
            toast.success('Hotel recommendations ready!');
          }
        } else {
          toast.info('No hotel data found.');
        }
      } catch (error) {
        console.error('Error enhancing hotels:', error);
        toast.error('Failed to enhance hotel information.');
      } finally {
        setIsEnhancing(false);
      }
    }
  };  
  const handleShareTrip = async () => {
    setIsSharing(true);
    try {
      const shareLink = await generateShareLink(id);
      const copied = await copyToClipboard(shareLink);
      
      if (copied) {
        toast.success('Share link copied to clipboard!');
      } else {
        // Fallback: show the link in a modal
        toast.info('Copy this link to share your trip: ' + shareLink);
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsSharing(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBudgetLabel = (budgetId) => {
    const budgets = ['Cheap', 'Moderate', 'Luxury'];
    return budgets[budgetId - 1] || 'Unknown';
  };

  const getTravelersLabel = (travelersId) => {
    const travelers = ['Just Me', 'A Couple', 'Family', 'Friends'];
    return travelers[travelersId - 1] || 'Unknown';
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
      
      // If this is an array of activities/places
      if (Array.isArray(obj)) {
        obj.forEach(item => searchForPlaces(item));
      } 
      // If this is an object with nested activities
      else if (typeof obj === 'object') {
        // Check if this object has activities array
        if (obj.activities && Array.isArray(obj.activities)) {
          obj.activities.forEach(activity => searchForPlaces(activity));
        } else if (obj.places && Array.isArray(obj.places)) {
          obj.places.forEach(place => searchForPlaces(place));
        } else {
          // Recursively search in all object values
          Object.values(obj).forEach(value => searchForPlaces(value));
        }
      }
    };
    
    searchForPlaces(data);
    return places;
  };
  
  // Function to render place recommendations
  const renderPlaceRecommendations = (places) => {
    if (!places || places.length === 0) return null;
    
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">🌟</span> Place Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {places.map((place, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{place.placeName || place.name || place.title || `Place ${index + 1}`}</h3>
                {(place.rating || place.reviewScore) && (
                  <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold">{place.rating || place.reviewScore || 'N/A'}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-3">{place.placeDetails || place.description || place.details || 'No details available'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(place.ticketPricing || place.price || place.cost) && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{place.ticketPricing || place.price || place.cost}</span>
                  </div>
                )}
                
                {(place.timeTravel || place.duration || place.timeToVisit) && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{place.timeTravel || place.duration || place.timeToVisit}</span>
                  </div>
                )}
                
                {place.bestTimeToVisit && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-gray-700">{place.bestTimeToVisit}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Automatically try to enhance hotel data when component mounts
  // We need to put this useEffect after all the variable declarations but before the return statement
  // But we also need to make sure it doesn't run before the component is fully initialized
  useEffect(() => {
    // Run enhancement when we have trip data and either have hotel data or need OSM fallback
    if (tripData && (hotelsData.length > 0 || enhancedHotels.length === 0)) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        enhanceHotels();
      }, 500);
      
      // Cleanup timer
      return () => clearTimeout(timer);
    }
  }, [tripData, hotelsData, enhancedHotels]); // Dependency array ensures this runs when hotelsData or enhancedHotels change
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if trip not found
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Debug logging
  console.log('TripDetails debug info:', {
    tripData,
    parsedTripData,
    itineraryData,
    hotelsData,
    itineraryLength: itineraryData?.length || 0
  });
  
  return (
    <div className="min-h-screen py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Background with image and overlay similar to Create Trip page - increased visibility */}
      {loadingImages ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      ) : destinationImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: `url('${destinationImage.url}')`,
            backgroundAttachment: 'fixed'
          }}
        ></div>
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1920&auto=format&fit=crop')",
            backgroundAttachment: 'fixed'
          }}
        ></div>
      )}
      
      {/* Semi-transparent overlay to ensure content readability - reduced opacity for better background visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-white/60 to-purple-900/10 backdrop-blur-sm"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {tripData.userSelection.location.label} Trip
          </h1>
          <p className="text-gray-600">Detailed itinerary and travel plan</p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Destination</p>
              <p className="font-semibold text-lg">{tripData.userSelection.location.label}</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Duration</p>
              <p className="font-semibold text-lg">{tripData.userSelection.days} Days</p>
            </div>
            <div className="border-r border-gray-100 pr-4">
              <p className="text-gray-600 text-sm">Travelers</p>
              <p className="font-semibold text-lg">{getTravelersLabel(tripData.userSelection.travelers)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Budget</p>
              <p className="font-semibold text-lg">{getBudgetLabel(tripData.userSelection.budget)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">Created on</p>
            <p className="font-semibold">{formatDate(tripData.createdAt)}</p>
          </div>
        </div>

        {/* Weather Information Section */}
        {weatherInfo && (
          <div className="mb-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🌤️</span> Weather Information
            </h2>
            <div className="whitespace-pre-line text-gray-700">
              {weatherInfo}
            </div>
          </div>
        )}

        {/* Place Recommendations Section */}
        {renderPlaceRecommendations(extractPlaceRecommendations(parsedTripData))}
        
        {/* Hotels Section */}
        {(hotelsData.length > 0 || enhancedHotels.length > 0) && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🏨</span> Recommended Hotels
              </h2>
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
              {(enhancedHotels.length > 0 ? enhancedHotels : hotelsData).map((hotel, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={hotel.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'} 
                      alt={hotel.hotelName || 'Hotel Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{hotel.hotelName || 'Hotel Name'}</h3>
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
                      <span className="text-2xl font-bold text-blue-600">
                        {hotel.osmData ? 'Check Availability' : (hotel.price || 'Price not available')}
                      </span>
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={() => {
                          if (hotel.website) {
                            window.open(hotel.website, '_blank');
                          } else if (hotel.osmData) {
                            // For OSM data, we can show a search link
                            const searchUrl = `https://www.booking.com/searchresults.en-us.html?ss=${encodeURIComponent(hotel.name || hotel.hotelName)}`;
                            window.open(searchUrl, '_blank');
                          } else {
                            // Default search
                            const searchUrl = `https://www.booking.com/searchresults.en-us.html?ss=${encodeURIComponent(hotel.hotelName || '')}`;
                            window.open(searchUrl, '_blank');
                          }
                        }}
                      >
                        {hotel.osmData ? 'Check Rates' : 'Book Now'}
                      </button>
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
        )}

        {/* Itinerary Section */}
        {itineraryData.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📅</span> Daily Itinerary
            </h2>
            <div className="space-y-8">
              {itineraryData.map((dayData, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <h3 className="text-xl font-bold text-white">{dayData.day || `Day ${index + 1}`}: {dayData.date || `Day ${index + 1}`}</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {dayData.plan && dayData.plan.map((place, placeIndex) => (
                        <div key={placeIndex} className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                          <div className="md:w-1/3 h-48 rounded-xl overflow-hidden">
                            <img 
                              src={place.placeImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'} 
                              alt={place.placeName || 'Place Image'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'; }}
                            />
                          </div>
                          <div className="md:w-2/3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xl font-bold text-gray-800">{place.placeName || place.name || place.title || 'Place Name'}</h4>
                              {(place.rating || place.reviewScore) && (
                                <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-sm font-semibold">{place.rating || place.reviewScore || 'N/A'}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{place.placeDetails || place.description || place.details || 'Details not available'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              {(place.timeToVisit || place.timeTravel || place.duration) && (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-gray-700">{place.timeToVisit || place.timeTravel || place.duration || 'Time not specified'}</span>
                                </div>
                              )}
                              {(place.ticketPricing || place.price || place.cost) && (
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-gray-700 font-semibold">{place.ticketPricing || place.price || place.cost || 'Price not available'}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700">View on Map</span>
                              </div>
                            </div>
                            
                            {/* Additional place details if available */}
                            {place.bestTimeToVisit && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <span className="font-semibold">Best Time to Visit:</span> {place.bestTimeToVisit}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Additional day information if available */}
                    {dayData.notes && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Day Notes:</h4>
                        <p className="text-gray-700">{dayData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Fallback for when itinerary data isn't properly structured
          (parsedTripData && 
           !itineraryData.length && 
           !parsedTripData?.itinerary && 
           !parsedTripData?.day1 && 
           !parsedTripData?.Day1 && 
           !Object.keys(parsedTripData || {}).some(key => key.toLowerCase().includes('day'))) ? (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📅</span> Trip Itinerary
              </h2>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="prose max-w-none">
                  {typeof parsedTripData === 'string' ? (
                    <pre className="whitespace-pre-wrap">{parsedTripData}</pre>
                  ) : (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(parsedTripData, null, 2)}</pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Show debug info when we have data but it's not displaying correctly
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">⚠️</span> Debug Info
              </h2>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="prose max-w-none">
                  <p><strong>Trip Data Available:</strong> {tripData ? 'Yes' : 'No'}</p>
                  <p><strong>Parsed Trip Data:</strong> {parsedTripData ? 'Yes' : 'No'}</p>
                  <p><strong>Itinerary Data Length:</strong> {itineraryData?.length || 0}</p>
                  <p><strong>Has Itinerary Property:</strong> {parsedTripData?.itinerary ? 'Yes' : 'No'}</p>
                  <p><strong>Has Day1 Property:</strong> {parsedTripData?.day1 ? 'Yes' : 'No'}</p>
                  <p><strong>Has Day1 Property (capitalized):</strong> {parsedTripData?.Day1 ? 'Yes' : 'No'}</p>
                  {parsedTripData && (
                    <>
                      <p><strong>Data Keys:</strong> {Object.keys(parsedTripData).join(', ')}</p>
                      <pre className="whitespace-pre-wrap mt-4 p-4 bg-gray-100 rounded">
                        {JSON.stringify(parsedTripData, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-black font-medium py-3 px-8 rounded-lg transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Download PDF
          </button>
          <button 
            onClick={handleShareTrip}
            disabled={isSharing}
            className={`font-medium py-3 px-8 rounded-lg transition-colors flex items-center ${isSharing ? 'bg-green-400 cursor-not-allowed text-black' : 'bg-green-600 hover:bg-green-700 text-black'}`}
          >
            {isSharing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Link...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Trip
              </>
            )}
          </button>
          <button className="bg-gray-800 hover:bg-gray-900 text-black font-medium py-3 px-8 rounded-lg transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;