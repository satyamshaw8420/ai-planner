import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { getLocationCoordinates } from '@/utils/geocodeHelper';

const WeatherIntegration = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock weather data for demonstration
  // In a real application, you would fetch this from a weather API like OpenWeatherMap
  const getMockWeatherData = (location) => {
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Thunderstorm'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Generate forecast for next 5 days
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toDateString(),
        high: Math.floor(Math.random() * 15) + 20, // 20-35°C
        low: Math.floor(Math.random() * 10) + 10,  // 10-20°C
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        wind: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
      });
    }
    
    return {
      location: location,
      current: {
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
        condition: condition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        wind: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        feelsLike: Math.floor(Math.random() * 10) + 20, // 20-30°C
      },
      forecast: forecast
    };
  };

  // Fetch weather data for a trip
  const fetchWeatherData = async (trip) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would:
      // 1. Get coordinates for the location
      // 2. Call a weather API with those coordinates
      // 3. Process and display the data
      
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const mockData = getMockWeatherData(trip.userSelection.location.label);
      setWeatherData(mockData);
      setSelectedTrip(trip);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'partly cloudy':
        return '⛅';
      case 'thunderstorm':
        return '⛈️';
      default:
        return '🌤️';
    }
  };

  // Get background color based on temperature
  const getTempBackground = (temp) => {
    if (temp < 10) return 'from-blue-400 to-blue-600';
    if (temp < 20) return 'from-green-400 to-green-600';
    if (temp < 30) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trip Weather Forecast</h1>
          <p className="text-gray-600">Check weather conditions for your travel destinations</p>
        </div>

        {/* Trip Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Trip</h2>
          
          {allTrips && allTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrips.map((trip) => (
                <div 
                  key={trip._id}
                  onClick={() => fetchWeatherData(trip)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                    selectedTrip?._id === trip._id 
                      ? 'ring-4 ring-blue-500 border-blue-500' 
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {trip.userSelection.location.label}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {trip.userSelection.days} days
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travel Dates:</span>
                        <span className="font-medium">Coming soon</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travelers:</span>
                        <span className="font-medium">
                          {trip.userSelection.travelers === 1 ? 'Just Me' : 
                           trip.userSelection.travelers === 2 ? 'A Couple' : 
                           trip.userSelection.travelers <= 6 ? 'Family' : 'Friends'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trip-details/${trip._id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        View Trip Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">🌤️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">Create some trips to check weather forecasts!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* Weather Display */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching weather data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6 mb-12">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {weatherData && !loading && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
            {/* Current Weather */}
            <div className={`bg-gradient-to-r ${getTempBackground(weatherData.current.temperature)} p-8 text-white`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{weatherData.location}</h2>
                  <p className="text-xl opacity-90">Current Weather</p>
                </div>
                <div className="mt-6 md:mt-0 text-center">
                  <div className="text-6xl mb-2">{getWeatherIcon(weatherData.current.condition)}</div>
                  <div className="text-5xl font-bold">{weatherData.current.temperature}°C</div>
                  <div className="text-xl">{weatherData.current.condition}</div>
                </div>
                <div className="mt-6 md:mt-0 grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Feels Like</div>
                    <div className="text-xl font-semibold">{weatherData.current.feelsLike}°C</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Humidity</div>
                    <div className="text-xl font-semibold">{weatherData.current.humidity}%</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                    <div className="text-sm opacity-80">Wind</div>
                    <div className="text-xl font-semibold">{weatherData.current.wind} km/h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">5-Day Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="font-semibold text-gray-800 mb-2">{day.date.split(' ')[0]}</div>
                    <div className="text-3xl my-2">{getWeatherIcon(day.condition)}</div>
                    <div className="text-gray-600 mb-1">{day.condition}</div>
                    <div className="flex justify-between mt-3">
                      <span className="text-red-500 font-semibold">{day.high}°</span>
                      <span className="text-blue-500 font-semibold">{day.low}°</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <div>Humidity: {day.humidity}%</div>
                      <div>Wind: {day.wind} km/h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Tips */}
            <div className="bg-blue-50 p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Travel Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Packing Suggestions</div>
                  <p className="text-gray-600 text-sm">
                    Based on current conditions, pack light clothing and sun protection.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Activity Recommendations</div>
                  <p className="text-gray-600 text-sm">
                    Perfect weather for outdoor activities and sightseeing.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-blue-600 font-semibold mb-2">Health Advisory</div>
                  <p className="text-gray-600 text-sm">
                    Stay hydrated and protect yourself from UV rays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!selectedTrip && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🌦️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Trip to View Weather</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose a trip from your history to see detailed weather forecasts for your destination. 
              Plan your activities and packing based on weather conditions.
            </p>
            <button
              onClick={() => navigate('/trip-history')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              View All Trips
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherIntegration;