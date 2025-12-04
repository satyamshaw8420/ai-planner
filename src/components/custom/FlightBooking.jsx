import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FlightBooking = () => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    cabinClass: 'economy',
    tripType: 'one-way'
  });
  
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planeImages, setPlaneImages] = useState([]);
  const [featuredPlanes, setFeaturedPlanes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  // Fetch plane images from Unsplash on component mount
  useEffect(() => {
    const fetchPlaneImages = async () => {
      try {
        setLoadingImages(true);
        // Using your actual Unsplash API key
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=airplane&per_page=20&client_id=-SM0favOiLSKdFiD9cMc58LkLseqUZLcTeohV3qLW_w&orientation=landscape`
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
        toast.error('Failed to load airplane images');
      } finally {
        setLoadingImages(false);
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
      // Mock flight search - in a real app, this would call an actual flight API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample flight data
      const mockFlights = [
        {
          id: 1,
          airline: 'Sky Airlines',
          flightNumber: 'SA123',
          departureTime: '08:30 AM',
          arrivalTime: '11:45 AM',
          duration: '3h 15m',
          stops: 0,
          price: {
            currency: '$',
            amount: 245.99
          }
        },
        {
          id: 2,
          airline: 'Cloud Airways',
          flightNumber: 'CA456',
          departureTime: '02:15 PM',
          arrivalTime: '05:30 PM',
          duration: '3h 15m',
          stops: 0,
          price: {
            currency: '$',
            amount: 289.50
          }
        },
        {
          id: 3,
          airline: 'Jet Stream',
          flightNumber: 'JS789',
          departureTime: '07:00 PM',
          arrivalTime: '10:20 PM',
          duration: '3h 20m',
          stops: 0,
          price: {
            currency: '$',
            amount: 199.99
          }
        }
      ];
      
      setFlights(mockFlights);
      toast.success(`Found ${mockFlights.length} flights`);
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
        {loadingImages ? (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Popular Aircraft</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-md bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : featuredPlanes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Popular Aircraft</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {featuredPlanes.map(plane => (
                <div key={plane.id} className="shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
                {[0, 1, 2, 3, 4, 5, 6].map(num => (
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
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Flights'}
              </button>
            </div>
          </div>
        </form>
        
        {/* Flight Results */}
        {flights.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Available Flights</h3>
            <div className="space-y-4">
              {flights.map(flight => (
                <div 
                  key={flight.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedFlight?.id === flight.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                  onClick={() => handleSelectFlight(flight)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-bold text-gray-900">{flight.airline}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600">{flight.flightNumber}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{flight.departureTime}</div>
                          <div className="text-sm text-gray-600">{searchParams.origin}</div>
                        </div>
                        
                        <div className="flex-1 mx-4">
                          <div className="relative">
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-600">
                              {flight.duration}
                            </div>
                          </div>
                          <div className="text-center text-sm text-gray-600">
                            {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-600">{searchParams.destination}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {flight.price.currency}{flight.price.amount}
                      </div>
                      <div className="text-sm text-gray-600">per person</div>
                      <button
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors duration-300"
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
                    <h4 className="font-bold text-gray-900">Selected Flight</h4>
                    <p className="text-gray-700">
                      {selectedFlight.airline} • {selectedFlight.flightNumber}
                    </p>
                  </div>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                    onClick={handleBookFlight}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightBooking;