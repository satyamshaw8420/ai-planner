import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { chatSession } from '@/service/AIModal'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
// Firebase imports
// Convex import
import { useSaveTrip } from '@/hooks/useConvexTrip';

function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: { label: '' },
    travelers: null,
    days: '',
    budget: null
  });
  
  // Convex mutation for saving trips
  const { saveTripToConvex: saveTrip } = useSaveTrip();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const inputRef = useRef(null)

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      console.log("Google Sign-In Success:", codeResp);
      setShowLoginModal(false);
      // Get user profile information first
      GetUserProfile({ access_token: codeResp.access_token });
      // Continue with trip creation after successful login
      // handleCreateTrip will be called from GetUserProfile after user data is stored
    },
    onError: (error) => {
      console.log("Google Sign-In Error:", error);
      toast.error("Google Sign-In failed. Please try again.");
    },
    // Using default flow (authorization code)
    scope: 'openid profile email',
    // Add redirect_uri if needed
    // redirect_uri: window.location.origin,
    // Add additional configuration for better compatibility
    prompt: 'select_account',
  });

  // Listen for the custom event from Header to show Google Sign-In
  useEffect(() => {
    const handleOpenGoogleSignin = () => {
      setShowLoginModal(true);
    };

    window.addEventListener('open-google-signin', handleOpenGoogleSignin);

    return () => {
      window.removeEventListener('open-google-signin', handleOpenGoogleSignin);
    };
  }, []);

  const GetUserProfile = (tokenInfo) => {
    console.log("Access Token Info:", tokenInfo);
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    })
      .then((resp) => {
        console.log("Full User Profile Response:", resp);
        console.log("User Data:", resp.data);
        
        // Format user data to match the expected structure
        const formattedUserData = {
          success: true,
          _id: resp.data.id || 'google-user',
          fullname: resp.data.name || 'Google User',
          username: resp.data.email?.split('@')[0] || 'google_user',
          email: resp.data.email || '',
          gender: 'not specified',
          profilepic: resp.data.picture || 'https://avatar.iran.liara.run/public/boy?username=google',
          message: "Successfully Logged In"
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(formattedUserData));
        console.log("User data stored in localStorage:", formattedUserData);
        // Continue with trip creation
        handleCreateTrip();
        // Here you can store user data in state or context
      })
      .catch(error => {
        console.log("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile. Please try again.");
      });
  };
  
  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    // Optionally, you can add a toast notification
    toast.success("You have been logged out successfully");
    // Optionally, redirect to home page or refresh the component
    // window.location.reload(); // Uncomment if you want to refresh the page
  };
  
  // Debounce timer ref
  const debounceTimer = useRef(null)

  const fetchSuggestions = async (searchQuery) => {
    console.log('Fetching suggestions for:', searchQuery);
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      // Using Photon API (free and open-source, faster alternative to Nominatim)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TravelEase/1.0 (educational project)',
            'Accept': 'application/json',
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Photon returns features array, we need to map it to our expected format
        const suggestions = data.features || []
        // Log the structure of the location data to console (similar to YouTube tutorial)
        console.log('Location suggestions:', {
          location: suggestions.map(item => ({
            label: item.properties.name,
            value: {
              description: item.properties.name,
              place_id: item.properties.osm_id,
              // ... other properties
            }
          }))
        })
        setSuggestions(suggestions)
        setShowSuggestions(true)
      } else {
        console.error('API request failed with status:', response.status);
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name, value) => {
    // Add validation for days field - limit to 5 or less
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
    }, 300); // 300ms debounce
  };

  const handleSuggestionClick = (suggestion) => {
    const locationLabel = suggestion.properties.name || '';
    handleInputChange('destination', locationLabel);
    setShowSuggestions(false);
    
    // Also update the location object with more details
    setFormData(prev => ({
      ...prev,
      location: {
        label: locationLabel,
        value: {
          description: locationLabel,
          place_id: suggestion.properties.osm_id
        }
      }
    }));
  };

  const onSubmit = async () => {
    console.log("Form submitted with data:", formData);
    
    // Validate form data
    if (!formData.location?.label) {
      toast.warning("📍 Please enter a destination");
      return;
    }
    
    if (!formData.travelers) {
      toast.warning("👥 Please select number of travelers");
      return;
    }
    
    if (!formData.days) {
      toast.warning("📅 Please enter number of days");
      return;
    }
    
    if (!formData.budget) {
      toast.warning("💰 Please select a budget option");
      return;
    }
    
    const daysNum = parseInt(formData.days);
    if (isNaN(daysNum) || daysNum <= 0) {
      toast.warning("📅 Please enter a valid number of days");
      return;
    }
    
    if (daysNum > 13) {
      toast.warning("📅 Please enter Trip Days less than 13");
      return;
    }
    
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Proceed with trip creation
    handleCreateTrip();
  };

  const handleCreateTrip = async () => {
    try {
      setIsCreatingTrip(true);
      console.log("Creating trip with data:", formData);
      
      // Validate form data
      if (!formData.location?.label || !formData.travelers || !formData.days || !formData.budget) {
        toast.error("⚠️ Please fill in all fields before creating your trip.");
        setIsCreatingTrip(false);
        return;
      }
      
      // Validate days input
      const days = parseInt(formData.days);
      if (isNaN(days) || days <= 0 || days > 13) {
        toast.error("⚠️ Please enter a valid number of days (1-13).");
        setIsCreatingTrip(false);
        return;
      }
      
      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      const userEmail = user?.email || 'unknown';
      const userId = user?._id || 'anonymous';
      
      // Fetch weather data for the destination
      console.log("Fetching weather data for:", formData.location.label);
      const weatherData = await fetchWeatherData(formData.location.label);
      if (weatherData) {
        console.log("Weather data fetched:", weatherData);
      } else {
        console.log("Failed to fetch weather data, continuing without it");
      }
      
      // Prepare prompt for AI
      const FINAL_PROMPT = AI_PROMPT
        .replace('{location}', formData.location.label)
        .replace('{totalDays}', formData.days)
        .replace('{traveler}', SelectTravelesList.find(item => item.id == formData.travelers)?.people || '')
        .replace('{budget}', SelectBudgetOptions.find(item => item.id == formData.budget)?.title || '')
        .replace('{totalDays}', formData.days);

      console.log("Sending prompt to AI:", FINAL_PROMPT);
      
      // Send to Gemini AI
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const aiResponse = result?.response?.text();
      console.log("AI Response:", aiResponse);
      
      // Try to extract JSON from the AI response if it's in a code block
      let tripDataObj = {};
      try {
        // Extract JSON from code blocks if present
        const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          tripDataObj = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire response as JSON
          tripDataObj = JSON.parse(aiResponse);
        }
      } catch (parseError) {
        console.log("Could not parse AI response as JSON, storing as string");
        tripDataObj = aiResponse;
      }
      
      // Combine AI trip data with weather data
      let tripData = '';
      
      // If we have weather data, add it to the trip information
      if (weatherData) {
        // Convert weather data to a concise string format
        const weatherInfo = `
**Current Weather in ${formData.location.label}:**
🌡️ ${weatherData.main.temp}°C, ${weatherData.weather[0].description}
💨 Humidity: ${weatherData.main.humidity}%, Wind: ${weatherData.wind.speed} m/s

`;
        
        // Add weather information to the beginning of the trip data
        if (typeof tripDataObj === 'string') {
          tripData = weatherInfo + tripDataObj;
        } else {
          // If it's an object, add weather info as a property
          tripDataObj.weather = {
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed
          };
          tripData = JSON.stringify(tripDataObj);
        }
      } else {
        // No weather data, just use the AI response
        tripData = typeof tripDataObj === 'string' ? tripDataObj : JSON.stringify(tripDataObj);
      }
      
      console.log("Saving trip data:", tripData);
      
      const tripId = await saveTrip(tripData, formData, userEmail, userId);
      console.log("Trip saved with ID:", tripId);
      
      // Navigate to trip details page
      if (tripId) {
        toast.success("🎉 Trip created successfully!");
        navigate(`/view-trip/${tripId}`);
      } else {
        throw new Error("Failed to save trip");
      }
    } catch (err) {
      console.error("Error creating trip:", err);
      toast.error("❌ Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  // Function to fetch weather data for a location
  const fetchWeatherData = async (location) => {
    try {
      // First, we need to get the coordinates for the location
      // Using the Photon API to get coordinates
      const geoResponse = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1`,
        {
          headers: {
            'User-Agent': 'TravelEase/1.0 (educational project)',
            'Accept': 'application/json',
          }
        }
      );
      
      if (!geoResponse.ok) {
        throw new Error('Failed to fetch location coordinates');
      }
      
      const geoData = await geoResponse.json();
      const feature = geoData.features[0];
      
      if (!feature) {
        throw new Error('Location not found');
      }
      
      const lat = feature.geometry.coordinates[1];
      const lon = feature.geometry.coordinates[0];
      
      // Now fetch weather data using OpenWeather API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8d762b07ed63fe6c7f941fe33a85497c&units=metric`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return null if weather data fetch fails, but don't stop the trip creation
      return null;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Background with image and overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1920&auto=format&fit=crop')",
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Semi-transparent overlay to ensure content readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-white/80 to-purple-900/10 backdrop-blur-[2px]"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-bold text-3xl text-center">🗺️ Describe Your Trip</h2>
        <p className="text-gray-500 text-center mt-3">
          ✨ Just provide some basic information, and our AI will create a customized travel plan for you.
        </p>

        <div className='mt-10'>
          {/* Destination Field */}
          <div>
            <h2 className='text-lg font-medium'>📍 Destination</h2>
            <p className='text-gray-500 text-sm'>
              🌍 Where do you want to go?
            </p>
            <div className="relative mt-2">
              <Input 
                placeholder="e.g., Paris, France" 
                value={formData.location.label}
                onChange={handleDestinationChange}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.properties.osm_id}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">✈️ {suggestion.properties.name}</div>
                      <div className="text-sm text-gray-500">
                        📍 {suggestion.properties.country || suggestion.properties.state || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showSuggestions && suggestions.length === 0 && formData.location?.label?.length > 2 && !loading && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 p-2">
                  <div className="p-2 text-gray-500">❌ No locations found</div>
                </div>
              )}
            </div>
          </div>

          {/* Traveler Selection */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>👥 Number of Travelers</h2>
            <p className='text-gray-500 text-sm'>
              👨‍👩‍👧‍👦 Choose how many people are traveling
            </p>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-5 mt-5'>
              {SelectTravelesList.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleInputChange('travelers', item.id)}
                  className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all bg-white/80 backdrop-blur-sm
                    ${formData.travelers === item.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300'}`}
                >
                  <h2 className='text-lg font-semibold'>🧳 {item.title}</h2>
                  <h2 className='text-sm text-gray-500'>📝 {item.desc}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Days Input */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>📅 Number of Days</h2>
            <p className='text-gray-500 text-sm'>
              🕐 How many days will your trip last?
            </p>
            <Input 
              placeholder="e.g., 3" 
              type="number"
              min="1"
              max="13"
              value={formData.days}
              onChange={(e) => handleInputChange('days', e.target.value)}
              className="mt-2 bg-white/80 backdrop-blur-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              ⏳ Maximum 13 days allowed
            </p>
          </div>

          {/* Budget Selection */}
          <div className='mt-10'>
            <h2 className='text-lg font-medium'>💰 Budget</h2>
            <p className='text-gray-500 text-sm'>
              💵 What is your budget range?
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-5'>
              {SelectBudgetOptions.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleInputChange('budget', item.id)}
                  className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all bg-white/80 backdrop-blur-sm
                    ${formData.budget === item.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300'}`}
                >
                  <h2 className='text-lg font-semibold'>💳 {item.title}</h2>
                  <h2 className='text-sm text-gray-500'>📋 {item.desc}</h2>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className='mt-10'>
            <Button 
              onClick={onSubmit}
              disabled={isCreatingTrip}
              className="w-full py-6 text-lg bg-black text-white hover:bg-gray-800 transition-all"
            >
              {isCreatingTrip ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  🤖 Creating Trip...
                </div>
              ) : (
                "🚀 Create Trip"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4 backdrop-blur-sm bg-white/90">
            <h2 className="text-2xl font-bold mb-4">🔐 Sign in to Continue</h2>
            <p className="text-gray-600 mb-6">
              📲 Please sign in with Google to create and save your trip plans.
            </p>
            <button
              onClick={() => login()}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors backdrop-blur-sm"
            >
              <FcGoogle className="text-xl" />
              <span>🟢 Sign in with Google</span>
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 font-medium py-2"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTrip;