import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchTrip } from '@/hooks/useFetchTrip';
import { useShareTrip } from '@/hooks/useShareTrip';
import { toast } from 'sonner';

const TripDetails = () => {
  const { id } = useParams();
  const { trip: tripData } = useFetchTrip(id);
  const { generateShareLink, copyToClipboard } = useShareTrip();
  const [isSharing, setIsSharing] = useState(false);
  
  // Show loading state while fetching data
  if (!tripData) {
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
  if (!tripData._id) {
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
  
  // Parse the tripData if it's a string
  let parsedTripData = null;
  if (typeof tripData.tripData === 'string') {
    try {
      // First try to parse as JSON
      parsedTripData = JSON.parse(tripData.tripData);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = tripData.tripData.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedTripData = JSON.parse(jsonMatch[1]);
        } else {
          // If no code block, try to parse the entire string
          parsedTripData = JSON.parse(tripData.tripData);
        }
      } catch (e2) {
        console.error('Failed to parse trip data:', e2);
        // If all parsing fails, use the raw string
        parsedTripData = tripData.tripData;
      }
    }
  } else {
    parsedTripData = tripData.tripData;
  }
  
  // If parsedTripData is still a string, try to convert it to an object
  if (typeof parsedTripData === 'string') {
    try {
      // Attempt to parse as JSON again
      parsedTripData = JSON.parse(parsedTripData);
    } catch (e) {
      // If it's still a string, check if it contains weather info at the beginning
      // Extract weather info if present
      const weatherMatch = parsedTripData.match(/\*\*Current Weather in ([\s\S]*?)\*\*\n([\s\S]*?)\n\n/);
      let weatherInfo = null;
      let remainingData = parsedTripData;
      
      if (weatherMatch) {
        weatherInfo = weatherMatch[2];
        remainingData = parsedTripData.replace(/\*\*Current Weather in [\s\S]*?\*\*\n[\s\S]*?\n\n/, '');
      }
      
      // Try to parse the remaining data as JSON
      try {
        const jsonMatch = remainingData.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedTripData = JSON.parse(jsonMatch[1]);
        } else {
          parsedTripData = JSON.parse(remainingData);
        }
        
        // Add weather info if extracted
        if (weatherInfo) {
          parsedTripData.weatherInfo = weatherInfo;
        }
      } catch (e2) {
        // If all parsing fails, create a fallback object with the raw data
        parsedTripData = {
          itinerary: [
            {
              day: "Trip Information",
              plan: [
                {
                  placeName: "Complete Trip Details",
                  placeDetails: parsedTripData,
                  timeToVisit: "All Day"
                }
              ]
            }
          ]
        };
      }
    }
  }
  
  // Handle different itinerary structures
  let itineraryData = [];
  let hotelsData = [];
  let weatherInfo = null;
  
  // Extract weather info if present in the object
  if (parsedTripData.weatherInfo) {
    weatherInfo = parsedTripData.weatherInfo;
  } else if (parsedTripData.weather) {
    // Format weather data if stored as structured object
    weatherInfo = `**Current Weather in ${tripData.userSelection.location.label}:**
🌡️ ${parsedTripData.weather.temperature}°C, ${parsedTripData.weather.description}
💨 Humidity: ${parsedTripData.weather.humidity}%, Wind: ${parsedTripData.weather.windSpeed} m/s`;
  }
  
  // Check if itinerary is an array (like in the Nepal example)
  if (Array.isArray(parsedTripData?.itinerary)) {
    itineraryData = parsedTripData.itinerary;
    hotelsData = parsedTripData.hotels || [];
  } 
  // Check if itinerary is an object with day keys (previous format)
  else if (parsedTripData?.itinerary && typeof parsedTripData.itinerary === 'object') {
    itineraryData = Object.entries(parsedTripData.itinerary).map(([dayKey, dayData], index) => ({
      day: `Day ${index + 1}`,
      date: dayData.date || dayData.theme || `Day ${index + 1}`,
      plan: dayData.plan || dayData.places || []
    }));
    hotelsData = parsedTripData.hotels || [];
  }
  
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

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Background with image and overlay similar to Create Trip page - increased visibility */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1920&auto=format&fit=crop')",
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Semi-transparent overlay to ensure content readability - adjusted for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/15 via-white/80 to-purple-900/15 backdrop-blur-sm"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {tripData.userSelection.location.label} Trip
          </h1>
          <p className="text-gray-600">Detailed itinerary and travel plan</p>
        </div>

        {/* Trip Summary Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
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
          <div className="mb-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🌤️</span> Weather Information
            </h2>
            <div className="whitespace-pre-line text-gray-700">
              {weatherInfo}
            </div>
          </div>
        )}

        {/* Hotels Section */}
        {hotelsData.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">🏨</span> Recommended Hotels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotelsData.map((hotel, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
                      <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{hotel.rating || 'N/A'}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{hotel.hotelAddress || 'Address not available'}</p>
                    <p className="text-gray-700 mb-4">{hotel.description || 'Description not available'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">{hotel.price || 'Price not available'}</span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Book Now
                      </button>
                    </div>
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
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
                              <h4 className="text-xl font-bold text-gray-800">{place.placeName || 'Place Name'}</h4>
                              <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{place.rating || 'N/A'}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{place.placeDetails || 'Details not available'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">{place.timeToVisit || place.timeTravel || 'Time not specified'}</span>
                              </div>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 font-semibold">{place.ticketPricing || 'Price not available'}</span>
                              </div>
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📅</span> Trip Itinerary
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="prose max-w-none">
                {typeof parsedTripData === 'string' ? (
                  <pre className="whitespace-pre-wrap">{parsedTripData}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(parsedTripData, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
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