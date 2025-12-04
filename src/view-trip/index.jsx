import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '../components/ui/button';

const ViewTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trip = useQuery(api.tripsQueries.getTripById, { id: id });
  const [isLoading, setIsLoading] = useState(!trip);

  useEffect(() => {
    if (trip) {
      setIsLoading(false);
    }
  }, [trip]);

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
  const { tripData, userSelection } = trip;
  
  // Parse the trip data if it's a string
  let parsedTripData = tripData;
  if (typeof tripData === 'string') {
    try {
      // Try to parse as JSON
      parsedTripData = JSON.parse(tripData);
    } catch (e) {
      // If parsing fails, keep it as a string
      console.log("Failed to parse trip data as JSON");
    }
  }
  
  // Log the actual data structure for debugging
  console.log("Full trip data:", trip);
  console.log("Parsed trip data:", parsedTripData);
  console.log("User selection:", userSelection);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Travel Plan</h1>
                <p className="text-gray-600">
                  {userSelection?.location?.label} • {userSelection?.days} Days • {userSelection?.travelers} Travelers
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
            </div>

            {/* Display trip data based on its structure */}
            {typeof parsedTripData === 'string' ? (
              // If it's still a string, display it directly
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Trip Details</h2>
                <pre className="whitespace-pre-wrap">{parsedTripData}</pre>
              </div>
            ) : (
              // If it's an object, try to display structured data
              <>
                {/* Hotels Section */}
                {parsedTripData.hotels && parsedTripData.hotels.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Recommended Hotels</h2>
                    <div className="space-y-4">
                      {parsedTripData.hotels.map((hotel, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <h3 className="font-medium text-gray-900">{hotel.hotelName}</h3>
                          <p className="text-gray-600 text-sm">{hotel.hotelAddress}</p>
                          <p className="text-gray-700 mt-2">{hotel.description}</p>
                          <p className="font-medium mt-2">{hotel.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Itinerary Section */}
                {(parsedTripData.itinerary || parsedTripData.day1 || parsedTripData.Day1) && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Daily Itinerary</h2>
                    <div className="space-y-6">
                      {/* Handle different itinerary structures */}
                      {Array.isArray(parsedTripData.itinerary) ? (
                        // Array format
                        parsedTripData.itinerary.map((day, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <h3 className="font-medium text-gray-900">{day.day || `Day ${index + 1}`}</h3>
                            {day.theme && <p className="text-gray-600 text-sm">{day.theme}</p>}
                            {day.plan && (
                              <div className="mt-2 space-y-2">
                                {day.plan.map((activity, actIndex) => (
                                  <div key={actIndex} className="ml-4">
                                    <h4 className="font-medium">{activity.placeName}</h4>
                                    <p className="text-gray-600 text-sm">{activity.placeDetails}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : parsedTripData.itinerary ? (
                        // Object format with day keys
                        Object.entries(parsedTripData.itinerary).map(([dayKey, dayData], index) => (
                          <div key={dayKey} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <h3 className="font-medium text-gray-900">Day {index + 1}: {dayData.theme || dayData.date}</h3>
                            <div className="mt-2 space-y-2">
                              {dayData.plan && dayData.plan.map((activity, actIndex) => (
                                <div key={actIndex} className="ml-4">
                                  <h4 className="font-medium">{activity.placeName}</h4>
                                  <p className="text-gray-600 text-sm">{activity.placeDetails}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Handle day1, day2, etc. format
                        Object.keys(parsedTripData)
                          .filter(key => key.toLowerCase().startsWith('day'))
                          .map((dayKey, index) => {
                            const dayData = parsedTripData[dayKey];
                            return (
                              <div key={dayKey} className="border-b border-gray-200 pb-4 last:border-b-0">
                                <h3 className="font-medium text-gray-900">Day {index + 1}: {dayData.theme || dayData.date || dayKey}</h3>
                                <div className="mt-2 space-y-2">
                                  {dayData.plan && dayData.plan.map((activity, actIndex) => (
                                    <div key={actIndex} className="ml-4">
                                      <h4 className="font-medium">{activity.placeName}</h4>
                                      <p className="text-gray-600 text-sm">{activity.placeDetails}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback for unknown structure */}
                {!parsedTripData.itinerary && !parsedTripData.day1 && !parsedTripData.Day1 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Trip Details</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(parsedTripData, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTrip;