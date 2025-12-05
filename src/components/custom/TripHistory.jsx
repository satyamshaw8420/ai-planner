import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { useShareTrip } from '@/hooks/useShareTrip';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
// Import Unsplash service
import { fetchDestinationImage } from '@/service/unsplashService';
// Import OpenStreetMap hotel service
import { fetchTripHotels } from '@/service/hotelService';


const TripHistory = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const { generateShareLink, copyToClipboard } = useShareTrip();
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sharingTripId, setSharingTripId] = useState(null);
  const [expandedTrips, setExpandedTrips] = useState({}); // Track which trips have expanded itineraries
  const [tripImages, setTripImages] = useState({}); // Store images for each trip
  const [loadingImages, setLoadingImages] = useState(false); // Loading state for images
  const [tripHotels, setTripHotels] = useState({}); // Store hotels for each trip
  const [loadingHotels, setLoadingHotels] = useState(false); // Loading state for hotels

  // Fetch images and hotels for trips
  useEffect(() => {
    const fetchTripData = async () => {
      if (!Array.isArray(allTrips) || allTrips.length === 0) return;
      
      setLoadingImages(true);
      setLoadingHotels(true);
      const newImages = {};
      const newHotels = {};
      
      try {
        for (const trip of allTrips) {
          if (trip && trip.userSelection && trip.userSelection.location && trip.userSelection.location.label) {
            // Only fetch if we don't already have the image
            if (!tripImages[trip._id]) {
              try {
                const image = await fetchDestinationImage(trip.userSelection.location.label);
                if (image) {
                  newImages[trip._id] = image;
                }
              } catch (error) {
                console.error('Error fetching image for trip:', trip._id, error);
              }
            }
            
            // Only fetch if we don't already have the hotels
            if (!tripHotels[trip._id]) {
              try {
                const hotels = await fetchTripHotels(trip.userSelection.location.label, 3);
                if (hotels && hotels.length > 0) {
                  newHotels[trip._id] = hotels;
                }
              } catch (error) {
                console.error('Error fetching hotels for trip:', trip._id, error);
              }
            }
          }
        }
        
        if (Object.keys(newImages).length > 0) {
          setTripImages(prev => ({ ...prev, ...newImages }));
        }
        
        if (Object.keys(newHotels).length > 0) {
          setTripHotels(prev => ({ ...prev, ...newHotels }));
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      } finally {
        setLoadingImages(false);
        setLoadingHotels(false);
      }
    };

    fetchTripData();
  }, [allTrips]);

  useEffect(() => {
    let filtered = allTrips;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip && trip.userSelection && trip.userSelection.location && trip.userSelection.location.label &&
        trip.userSelection.location.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (filter !== 'all') {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      filtered = filtered.filter(trip => {
        if (!trip || !trip.createdAt) return false;
        const tripDate = trip.createdAt;
        switch (filter) {
          case 'today':
            return (now - tripDate) < oneDay;
          case 'week':
            return (now - tripDate) < 7 * oneDay;
          case 'month':
            return (now - tripDate) < 30 * oneDay;
          default:
            return true;
        }
      });
    }
    
    setFilteredTrips(filtered);
  }, [allTrips, searchTerm, filter]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  // Toggle itinerary expansion for a trip
  const toggleItinerary = (tripId) => {
    setExpandedTrips(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  // Function to parse trip data
  const parseTripData = (tripData) => {
    if (!tripData) return null;
    
    // Parse the trip data if it's a string
    let parsedData = tripData;
    if (typeof tripData === 'string') {
      try {
        // Try to parse as JSON
        parsedData = JSON.parse(tripData);
      } catch (e) {
        // If parsing fails, try to extract JSON from the string
        const jsonStart = tripData.indexOf('{');
        const jsonEnd = tripData.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          try {
            const jsonString = tripData.substring(jsonStart, jsonEnd + 1);
            parsedData = JSON.parse(jsonString);
          } catch (extractError) {
            // Try to parse as a more relaxed JSON (sometimes AI adds extra commas or formatting issues)
            try {
              // Attempt to fix common JSON issues
              let fixedJsonString = tripData.substring(jsonStart, jsonEnd + 1);
              // Fix trailing commas
              fixedJsonString = fixedJsonString.replace(/,\s*([}\]])/g, '$1');
              parsedData = JSON.parse(fixedJsonString);
            } catch (fixError) {
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
    return parsedData;
  };

  // Function to render time slot activities
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

  // Function to render day plan
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

  // Function to render activity cards
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
                  <span className="text-gray-700">{activity.ticketPricing}</span>
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

  // Function to render itinerary for a trip
  const renderItinerary = (trip) => {
    if (!trip || !trip.tripData) return null;
    
    const parsedData = parseTripData(trip.tripData);
    if (!parsedData) return null;
    
    // Get hotels for this trip
    const hotels = tripHotels[trip._id] || [];
    
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🗓️ Daily Itinerary</h2>
        
        {/* Handle different itinerary structures */}
        {parsedData?.itinerary ? (
          // If itinerary is an array
          Array.isArray(parsedData.itinerary) ? (
            parsedData.itinerary.map((day, index) => {
              return renderDayPlan(day, index + 1);
            })
          ) : (
            // If itinerary is an object with day keys
            Object.entries(parsedData.itinerary)
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
          Object.keys(parsedData || {})
            .filter(key => key.toLowerCase().startsWith('day'))
            .sort((a, b) => {
              // Sort day keys numerically (day1, day2, day10, etc.)
              const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
              const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
              return numA - numB;
            })
            .map((dayKey, index) => {
              const dayData = parsedData[dayKey];
              // Use the numeric part of the key for day numbering, fallback to index+1
              const dayNumber = parseInt(dayKey.replace(/[^0-9]/g, '')) || (index + 1);
              return renderDayPlan(dayData, dayNumber);
            })
        )}
        
        {/* Hotel Recommendations Section */}
        {hotels.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">🏨</span> Hotel Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hotels.map((hotel, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{hotel.name}</h3>
                    {hotel.stars && (
                      <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                        {Array(parseInt(hotel.stars) || 0).fill('⭐')}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
                  <p className="text-gray-700 text-sm mb-3">{hotel.description}</p>
                  <button 
                    className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const searchUrl = `https://www.booking.com/searchresults.en-us.html?ss=${encodeURIComponent(hotel.name)}`;
                      window.open(searchUrl, '_blank');
                    }}
                  >
                    Check Rates
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trip History</h1>
          <p className="text-gray-600">View and manage all your planned trips</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1.5 text-sm rounded-lg ${filter === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setFilter('all')}
              >
                All Time
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-lg ${filter === 'today' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setFilter('today')}
              >
                Today
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-lg ${filter === 'week' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setFilter('week')}
              >
                This Week
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-lg ${filter === 'month' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Trip Cards Grid */}
        {Array.isArray(filteredTrips) && filteredTrips.length > 0 ? (
          <div className="space-y-8">
            {filteredTrips.map((trip, index) => (
              <div key={trip._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/trip-details/${trip._id}`)}
                >
                  {/* Trip Image Carousel */}
                  <div className="relative">
                    {loadingImages ? (
                      <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center rounded-t-2xl">
                        <div className="text-gray-500 text-sm">Loading...</div>
                      </div>
                    ) : (
                      <div className="relative h-48 rounded-t-2xl overflow-hidden">
                        {tripImages[trip._id] ? (
                          <img 
                            src={tripImages[trip._id].url} 
                            alt={trip.userSelection.location.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <div className="text-white text-sm">No image available</div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow">
                      {trip.userSelection.days} Days
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">Created on</p>
                        <p className="font-semibold">{formatDate(trip.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Budget</p>
                        <p className="font-semibold">{getBudgetLabel(trip.userSelection.budget)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">Travelers</p>
                        <p className="font-semibold">{getTravelersLabel(trip.userSelection.travelers)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {trip.userSelection.days}
                          </span>
                        </div>
                        <span className="text-gray-600">Days</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Expandable Itinerary Section */}
                <div className="px-6 pb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItinerary(trip._id);
                    }}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {expandedTrips[trip._id] ? 'Hide Itinerary' : 'Show Itinerary'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ml-1 transition-transform ${expandedTrips[trip._id] ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {expandedTrips[trip._id] && renderItinerary(trip)}
                </div>
                
                <div className="p-6 pt-0 border-t border-gray-100 flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trip-details/${trip._id}`);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center"
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingTripId(trip._id === sharingTripId ? null : trip._id);
                      generateShareLink(trip._id);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center"
                  >
                    Share
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-white/50">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Trips Yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Create Your First Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;