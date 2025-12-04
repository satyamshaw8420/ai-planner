import React, { useState, useEffect } from 'react';
import { searchFlights } from '@/service/flightApi';
import { toast } from 'sonner';

const FlightBooking = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    tripType: 'one-way', // one-way or round-trip
    adults: 1,
    children: 0,
    cabinClass: 'economy'
  });
  
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [planeImages, setPlaneImages] = useState([]);
  const [featuredPlanes, setFeaturedPlanes] = useState([]);

  // Fetch plane images from Unsplash
  useEffect(() => {
    const fetchPlaneImages = async () => {
      try {
        // Using Unsplash API with a search query for "airplane"
        // Note: In a production app, you would use your own API key
        // For demo purposes, we're using a placeholder that will show fallback images
        // To use real Unsplash images, register for a free API key at https://unsplash.com/developers
        // and replace 'YOUR_UNSPLASH_ACCESS_KEY' with your actual key
        const response = await fetch(
          'https://api.unsplash.com/search/photos?query=airplane&per_page=20&client_id=YOUR_UNSPLASH_ACCESS_KEY&orientation=landscape'
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Extract image URLs from the response
          const imageUrls = data.results.map(photo => ({
            id: photo.id,
            url: photo.urls.regular,
            thumb: photo.urls.thumb,
            small: photo.urls.small,
            alt: photo.alt_description || 'Airplane'
          }));
          
          setPlaneImages(imageUrls);
          // Set first 5 images as featured planes
          setFeaturedPlanes(imageUrls.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching plane images:', error);
        // Fallback to default if API fails
      }
    };

    fetchPlaneImages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const result = await searchFlights(
        searchParams.origin,
        searchParams.destination,
        searchParams.departureDate,
        searchParams.returnDate,
        searchParams.adults,
        searchParams.children,
        searchParams.cabinClass
      );
      
      if (result && result.data && result.data.flights) {
        // Handle our sample data format
        setFlights(result.data.flights);
        toast.success(`Found ${result.data.flights.length} flights`);
      } else if (result && result.success && result.data && result.data.flights) {
        setFlights(result.data.flights);
        toast.success(`Found ${result.data.flights.length} flights`);
      } else {
        toast.error('No flights found for your search criteria');
        setFlights([]);
      }
    } catch (error) {
      console.error('Error searching flights:', error);
      toast.error('Failed to search flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    toast.success(`Selected flight with price ${flight.price.currency} ${flight.price.amount}`);
  };

  const handleBookFlight = () => {
    if (!selectedFlight) {
      toast.error('Please select a flight first');
      return;
    }
    
    // In a real implementation, this would redirect to a booking page or open a booking modal
    toast.success(`Proceeding to book flight with price ${selectedFlight.price.currency} ${selectedFlight.price.amount}`);
    // Here you would typically redirect to a booking confirmation page or open a modal
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">✈️ Flight Booking</h2>
        
        {/* Featured Planes Carousel */}
        {featuredPlanes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Popular Aircraft</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {featuredPlanes.map(plane => (
                <div key={plane.id} className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src={plane.small} 
                    alt={plane.alt} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="text"
                name="origin"
                value={searchParams.origin}
                onChange={handleInputChange}
                placeholder="City or airport code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                name="destination"
                value={searchParams.destination}
                onChange={handleInputChange}
                placeholder="City or airport code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
              <input
                type="date"
                name="departureDate"
                value={searchParams.departureDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
              <select
                name="tripType"
                value={searchParams.tripType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="one-way">One Way</option>
                <option value="round-trip">Round Trip</option>
              </select>
            </div>
          </div>
          
          {searchParams.tripType === 'round-trip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                <input
                  type="date"
                  name="returnDate"
                  value={searchParams.returnDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <select
                name="adults"
                value={searchParams.adults}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <select
                name="children"
                value={searchParams.children}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
              <select
                name="cabinClass"
                value={searchParams.cabinClass}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  'Search Flights'
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Flight Results */}
        {flights.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Available Flights</h3>
            <div className="space-y-4">
              {flights.map((flight, index) => (
                <div 
                  key={flight.id} 
                  className={`border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedFlight?.id === flight.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectFlight(flight)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {/* Display plane image instead of placeholder */}
                        {planeImages && planeImages.length > 0 ? (
                          <div className="relative">
                            <img 
                              src={planeImages[index % planeImages.length].small} 
                              alt="Airplane" 
                              className="w-16 h-16 object-contain"
                            />
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                              ✈️
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                        <div className="ml-4">
                          <h4 className="font-bold text-lg">{flight.airline}</h4>
                          <p className="text-gray-600">{flight.flightNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-center">
                          <p className="text-xl font-bold">{flight.departureTime}</p>
                          <p className="text-gray-600">{searchParams.origin}</p>
                        </div>
                        
                        <div className="flex-1 mx-4 relative">
                          <div className="border-t border-gray-300 my-2"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-600">
                            {flight.duration}
                          </div>
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-gray-400"></div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-gray-400"></div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-xl font-bold">{flight.arrivalTime}</p>
                          <p className="text-gray-600">{searchParams.destination}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{flight.aircraft}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                      <p className="text-2xl font-bold text-blue-600">{flight.price.currency} {flight.price.amount}</p>
                      <button 
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFlight(flight);
                          handleBookFlight();
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedFlight && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg">Selected Flight</h4>
                    <p className="text-gray-700">{selectedFlight.airline} - {selectedFlight.flightNumber}</p>
                    <p className="text-gray-600">{selectedFlight.departureTime} → {selectedFlight.arrivalTime}</p>
                  </div>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    onClick={handleBookFlight}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {flights.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search for Flights</h3>
            <p className="text-gray-500">Enter your travel details above to find available flights</p>
            
            {/* Display some plane images as decoration */}
            {planeImages.length > 0 && (
              <div className="mt-8 flex justify-center space-x-4">
                {planeImages.slice(0, 4).map((plane, index) => (
                  <div key={plane.id} className="w-16 h-16 opacity-70 hover:opacity-100 transition-opacity duration-300">
                    <img 
                      src={plane.thumb} 
                      alt={plane.alt} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightBooking;