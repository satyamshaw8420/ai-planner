import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { Button } from '../components/ui/button'

import { toast } from 'sonner'
import { chatSession } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
// Convex import
import { useSaveTrip } from '@/hooks/useConvexTrip';
import GoogleLoginModal from '../components/custom/GoogleLoginModal';
// Import Unsplash service
import { fetchDestinationImage } from '@/service/unsplashService';
// Import OpenStreetMap hotel service
import { fetchDestinationHotel } from '@/service/hotelService';


function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: { label: '' },
    travelers: null,
    days: '',
    budget: null,
    // New fields
    numberOfMembers: '',
    startDate: ''
  });
  
  // Convex mutation for saving trips
  const { saveTripToConvex: saveTrip } = useSaveTrip();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const [destinationImage, setDestinationImage] = useState(null); // Store destination image
  const [loadingImage, setLoadingImage] = useState(false); // Loading state for image fetch
  const [recommendedHotel, setRecommendedHotel] = useState(null); // Store recommended hotel
  const [loadingHotel, setLoadingHotel] = useState(false); // Loading state for hotel fetch
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Listen for the custom event from Header to show Google Sign-In
  useEffect(() => {
    const handleOpenGoogleSignin = () => {
      setShowLoginModal(true);
    };

    window.addEventListener('open-google-signin', handleOpenGoogleSignin);

    return () => {
      window.removeEventListener('open-google-signin', handleOpenGoogleSignin);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch destination image and hotel recommendations when location changes
  useEffect(() => {
    const fetchData = async () => {
      if (formData.location?.label) {
        // Fetch image
        setLoadingImage(true);
        try {
          const image = await fetchDestinationImage(formData.location.label);
          setDestinationImage(image);
        } catch (error) {
          console.error('Error fetching destination image:', error);
          setDestinationImage(null);
        } finally {
          setLoadingImage(false);
        }
        
        // Fetch hotel recommendation
        setLoadingHotel(true);
        try {
          const hotel = await fetchDestinationHotel(formData.location.label);
          setRecommendedHotel(hotel);
        } catch (error) {
          console.error('Error fetching hotel recommendation:', error);
          setRecommendedHotel(null);
        } finally {
          setLoadingHotel(false);
        }
      } else {
        setDestinationImage(null);
        setRecommendedHotel(null);
      }
    };

    // Debounce the data fetch
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [formData.location?.label]);

  // Fetch location suggestions from Photon (Mapbox) API
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Using Photon API for autocomplete
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      // Transform Photon response to match our expected format
      const transformedSuggestions = data.features?.map(feature => ({
        properties: {
          name: feature.properties.name || '',
          city: feature.properties.city || feature.properties.county || '',
          country: feature.properties.country || '',
          state: feature.properties.state || ''
        },
        geometry: feature.geometry,
        place_type: [feature.properties.osm_key || 'place']
      })) || [];
      
      setSuggestions(transformedSuggestions);
      setShowSuggestions(transformedSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (name, value) => {
    // Special validation for days field
    if (name === 'days') {
      const daysValue = parseInt(value);
      if (!isNaN(daysValue) && daysValue > 13) {
        console.log("Please enter Trip Days less than 13");
        // Prevent values greater than 5
        return;
      }
    }
    
    console.log('Updating form data:', name, value);
    if (name === 'destination') {
      // For destination, we update the location.label property
      setFormData(prev => ({
        ...prev,
        location: { label: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    handleInputChange('destination', value);
      
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce delay
    
    // Show suggestions container immediately for better UX
    if (value.length > 2) {
      setShowSuggestions(true);
    }
  };

  const handleCreateTrip = async () => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error("Please log in to create a trip");
      // Show login modal
      setShowLoginModal(true);
      return;
    }
    
    // Validate form data
    if (!formData.location || !formData.location.label) {
      toast.error("Please enter a destination");
      return;
    }
    
    if (!formData.travelers) {
      toast.error("Please select number of travelers");
      return;
    }
    
    // Validate number of members
    if (!formData.numberOfMembers) {
      toast.error("Please enter the number of members");
      return;
    }
    
    const membersNum = parseInt(formData.numberOfMembers);
    if (isNaN(membersNum) || membersNum <= 0) {
      toast.error("Please enter a valid number of members");
      return;
    }
    
    if (membersNum > 20) {
      toast.error("Number of members cannot exceed 20");
      return;
    }
    
    if (!formData.days) {
      toast.error("Please enter number of days");
      return;
    }
    
    if (!formData.budget) {
      toast.error("Please select a budget option");
      return;
    }
    
    // Validate start date
    if (!formData.startDate) {
      toast.error("Please select a start date");
      return;
    }
    
    const selectedDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for comparison
    
    if (selectedDate < today) {
      toast.error("Start date cannot be in the past");
      return;
    }
    
    // Validate days is a number
    const daysNum = parseInt(formData.days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.error("Please enter a valid number of days");
      return;
    }
    
    // Limit days to maximum 13
    if (daysNum > 13) {
      toast.error("Trip days cannot exceed 13");
      return;
    }
    
    setIsCreatingTrip(true);
    
    try {
      // Prepare the prompt with form data
      const FINAL_PROMPT = AI_PROMPT
        .replace('{location}', formData.location?.label || '')
        .replace('{totalDays}', formData.days)
        .replace('{traveler}', `${formData.numberOfMembers} ${formData.numberOfMembers == 1 ? 'person' : 'people'}`)
        .replace('{budget}', formData.budget.title)
        .replace('{totalDays}', formData.days) // Duplicate replacement for safety
        
      console.log("Final Prompt:", FINAL_PROMPT);
      
      // Send prompt to Google Gemini API
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log("AI Response:", result);
      
      // Log the raw AI response for debugging
      console.log("Raw AI Response Text:", result.response.text());
      
      // Save the trip to Convex database
      const userObj = JSON.parse(userData);
      console.log('About to save trip with formData:', formData);
      const savedTrip = await saveTrip({
        userSelection: formData,
        tripData: result.response.text(),
        userEmail: userObj.email,
        userId: userObj._id,
        userInformation: {
          userId: userObj._id || 'anonymous',
          userEmail: userObj.email || 'unknown',
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }
      });
      
      console.log("Trip saved to Convex:", savedTrip);
      
      // Navigate to the trip view page
      if (savedTrip) {
        navigate(`/view-trip/${savedTrip}`);
      } else {
        toast.error("Failed to save trip. Please try again.");
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast.error("Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const OnSelectBudget = (item) => {
    console.log("Selected Budget:", item);
    setFormData(prev => ({
      ...prev,
      budget: item
    }));
  };

  const OnSelectTraveler = (item) => {
    console.log("Selected Traveler:", item);
    setFormData(prev => ({
      ...prev,
      travelers: item
    }));
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    console.log('Selected suggestion:', suggestion);
    // Create a comprehensive location label from Photon data
    const locationParts = [
      suggestion.properties.name,
      suggestion.properties.city,
      suggestion.properties.state,
      suggestion.properties.country
    ].filter(Boolean);
    
    const locationLabel = locationParts.join(', ') || 'Unknown Location';
    handleInputChange('destination', locationLabel);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Blur the input to hide keyboard on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="mb-10 relative overflow-hidden">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        
      </div>
      
      <div className="relative z-10">
        <h2 className="font-bold text-4xl text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Tell us your travel preferences 🤖🌴
        </h2>
        <p className="mt-2 text-gray-600 text-center text-lg max-w-2xl mx-auto">
          Just provide some basic information, and our AI trip planner will generate a customized itinerary for you!
        </p>

        <div className="mt-8 md:mt-12 backdrop-blur-xl bg-white/70 border border-white/70 shadow-2xl shadow-blue-500/20 p-6 lg:p-8 rounded-2xl max-w-4xl mx-auto transition-all duration-500 hover:shadow-blue-500/30">
        {/* Destination Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">What is your destination of choice?</span>
          </h2>
          <div className="relative mt-4 pb-2 flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <Input 
              placeholder="Enter a destination (e.g. Paris, Bali, Tokyo)" 
              value={formData.location?.label || ''}
              onChange={handleDestinationChange}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks on suggestions
                setTimeout(() => {
                  if (showSuggestions) {
                    setShowSuggestions(false);
                  }
                }, 150);
              }}
              ref={inputRef}
              className="py-6 pl-10 pr-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm group-hover:border-blue-300 w-full rounded-l-xl"
            />
          </div>
          
          {/* Destination Image Carousel */}
          {(loadingImage || destinationImage) && (
            <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
              {loadingImage ? (
                <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center rounded-t-xl">
                  <div className="text-gray-500">Loading image...</div>
                </div>
              ) : destinationImage ? (
                <>
                  <div className="relative h-48 rounded-t-xl overflow-hidden">
                    <img 
                      src={destinationImage.url} 
                      alt={formData.location?.label || "Destination"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 text-sm text-gray-600">
                    Photo by <a 
                      href={destinationImage.photographerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {destinationImage.photographer}
                    </a> on Unsplash
                  </div>
                </>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-xl">
                  <div className="text-gray-500">No image available</div>
                </div>
              )}
            </div>
          )}
            
            {/* Hotel Recommendation */}
            {(loadingHotel || recommendedHotel) && (
              <div className="mt-4 rounded-2xl overflow-hidden shadow-xl border border-gray-200 backdrop-blur-sm bg-white/80 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <span className="text-2xl">🏨</span>
                    <span>Recommended Hotel</span>
                  </h3>
                  <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse"></div>
                </div>
                {loadingHotel ? (
                  <div className="p-6 bg-gray-50/50">
                    <div className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
                  </div>
                ) : recommendedHotel ? (
                  <div className="p-6 bg-white/90 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-xl text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{recommendedHotel.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{recommendedHotel.address}</p>
                      </div>
                      {recommendedHotel.stars && (
                        <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                          {Array(parseInt(recommendedHotel.stars) || 0).fill('⭐')}
                          <span className="ml-1">{recommendedHotel.stars}-star</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">{recommendedHotel.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Check availability
                      </span>
                      <button 
                        className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-1 group"
                        onClick={() => {
                          const searchUrl = `https://www.booking.com/searchresults.en-us.html?ss=${encodeURIComponent(recommendedHotel.name)}`;
                          window.open(searchUrl, '_blank');
                        }}
                      >
                        <span>View Rates</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50/50 text-center">
                    <p className="text-gray-500">No hotel recommendations available for this location</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-20 w-80 right-0 top-0 bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto transition-all duration-200 ease-in-out opacity-100 scale-100"
              >
                {suggestions.map((suggestion, index) => {
                  // Extract location details for Photon API
                  const name = suggestion.properties.name || '';
                  const city = suggestion.properties.city || '';
                  const state = suggestion.properties.state || '';
                  const country = suggestion.properties.country || '';
                  
                  // Create a display label
                  const displayLabel = [name, city, state, country].filter(Boolean).join(', ');
                  
                  // Get place type for Photon API
                  const placeType = suggestion.place_type?.[0] || 'place';
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="font-medium">{displayLabel}</div>
                      <div className="text-xs text-gray-500 capitalize">{placeType}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Travelers Selection Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">Who are you traveling with?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
            {SelectTravelesList.map((item, index) => (
              <div 
                key={index}
                onClick={() => OnSelectTraveler(item)}
                className={`cursor-pointer p-5 border rounded-2xl transition-all duration-300 hover:shadow-xl backdrop-blur-sm ${
                  formData.travelers?.id === item.id 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 shadow-lg transform scale-105 ring-2 ring-blue-500/30' 
                    : 'border-gray-200 bg-white/70 hover:border-blue-300 hover:bg-white/90'
                }`}
              >
                <h2 className="text-3xl mb-2">{item.icon}</h2>
                <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
                <h2 className="text-sm text-gray-600 mt-1">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* Number of Members Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">How many people are going on this trip?</span>
          </h2>
          <div className="relative mt-4 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <Input 
              placeholder="Enter number of members (1-20)" 
              type="number"
              min="1"
              max="20"
              value={formData.numberOfMembers}
              onChange={(e) => handleInputChange('numberOfMembers', e.target.value)}
              className="py-6 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all w-full bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Maximum 20 members allowed
          </p>
        </div>

        {/* Start Date Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">When will your trip start?</span>
          </h2>
          <div className="relative mt-4 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <Input 
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Today or future dates only
              className="py-6 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all w-full bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
            />
          </div>
        </div>

        {/* Days Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">How many days are you planning your trip?</span>
          </h2>
          <div className="relative mt-4 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Input 
              placeholder="Ex. 3" 
              type="number"
              min="1"
              max="13"
              value={formData.days}
              onChange={(e) => handleInputChange('days', e.target.value)}
              className="py-6 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all w-full bg-white/80 backdrop-blur-sm group-hover:border-blue-300"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Maximum 13 days allowed
          </p>
        </div>

        {/* Budget Field */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">What is your budget for this trip?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div 
                key={index}
                onClick={() => OnSelectBudget(item)}
                className={`cursor-pointer p-5 border rounded-2xl transition-all duration-300 hover:shadow-xl backdrop-blur-sm ${
                  formData.budget?.id === item.id 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 shadow-lg transform scale-105 ring-2 ring-blue-500/30' 
                    : 'border-gray-200 bg-white/70 hover:border-blue-300 hover:bg-white/90'
                }`}
              >
                <h2 className="text-3xl mb-2">{item.icon}</h2>
                <h2 className="text-lg font-bold text-gray-800">{item.title}</h2>
                <h2 className="text-sm text-gray-600 mt-1">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-8 group">
          <h2 className="text-xl my-2 font-medium flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">Popular Destinations</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              'Paris, France',
              'Bali, Indonesia',
              'Tokyo, Japan',
              'New York, USA',
              'Dubai, UAE',
              'London, UK',
              'Rome, Italy',
              'Sydney, Australia'
            ].map((destination, index) => (
              <button
                key={index}
                onClick={() => handleInputChange('destination', destination)}
                className="text-left p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:bg-blue-50/50 group"
              >
                <span className="group-hover:text-blue-600 transition-colors">{destination}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Trip Button */}
        <div className="mt-8">
          <button 
            onClick={handleCreateTrip}
            disabled={isCreatingTrip}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            {isCreatingTrip ? (
              <div className="flex items-center justify-center relative z-10">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Your Trip...
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-2xl">✈️</span>
                <span>Create My Trip</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Use shared Google Login Modal */}
      <GoogleLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default CreateTrip;