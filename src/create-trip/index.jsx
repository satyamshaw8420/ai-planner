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
  const inputRef = useRef(null)
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

  // Fetch location suggestions from Mapbox API
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=pk.eyJ1Ijoic2h1YmgxMDA3IiwiYSI6ImNtMWNybmJwcjAwN2kycHBvdzZ0MW10aWsifQ.0G-8C5KXgGsHMA-MOrgRew&types=place,locality,address&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
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
    const locationLabel = suggestion.properties.name || suggestion.properties.city || suggestion.properties.country || 'Unknown Location';
    handleInputChange('destination', locationLabel);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Blur the input to hide keyboard on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="mb-10">
      <h2 className="font-bold text-3xl text-center">Tell us your travel preferences 🤖🌴</h2>
      <p className="mt-2 text-gray-500 text-center">Just provide some basic information, and our trip planner will generate a customized itinerary for you!</p>

      <div className="mt-6 md:mt-8 shadow-md p-6 lg:p-8 rounded-xl max-w-4xl mx-auto bg-white">
        {/* Destination Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">📍 What is your destination of choice?</h2>
          <div className="relative">
            <Input 
              placeholder="Enter a destination (e.g. Paris, Bali, Tokyo)" 
              value={formData.location?.label || ''}
              onChange={handleDestinationChange}
              ref={inputRef}
              className="py-6 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => {
                  // Extract location details
                  const name = suggestion.properties.name || '';
                  const city = suggestion.properties.city || '';
                  const country = suggestion.properties.country || '';
                  
                  // Create a display label
                  const displayLabel = [name, city, country].filter(Boolean).join(', ');
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{displayLabel}</div>
                      {suggestion.place_type && (
                        <div className="text-xs text-gray-500 capitalize">{suggestion.place_type.join(', ')}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Travelers Selection Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">👥 Who are you traveling with?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5">
            {SelectTravelesList.map((item, index) => (
              <div 
                key={index}
                onClick={() => OnSelectTraveler(item)}
                className={`cursor-pointer p-4 border rounded-xl hover:shadow-md transition-all ${
                  formData.travelers?.id === item.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h2 className="text-2xl"> {item.icon}</h2>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* Number of Members Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">👥 How many people are going on this trip?</h2>
          <Input 
            placeholder="Enter number of members (1-20)" 
            type="number"
            min="1"
            max="20"
            value={formData.numberOfMembers}
            onChange={(e) => handleInputChange('numberOfMembers', e.target.value)}
            className="py-6 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-full md:w-1/3"
          />
          <p className="text-sm text-gray-500 mt-2">Maximum 20 members allowed</p>
        </div>

        {/* Start Date Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">📅 When will your trip start?</h2>
          <Input 
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Today or future dates only
            className="py-6 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-full md:w-1/3"
          />
        </div>

        {/* Days Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">🗓️ How many days are you planning your trip?</h2>
          <Input 
            placeholder="Ex. 3" 
            type="number"
            min="1"
            max="13"
            value={formData.days}
            onChange={(e) => handleInputChange('days', e.target.value)}
            className="py-6 px-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-full md:w-1/3"
          />
          <p className="text-sm text-gray-500 mt-2">Maximum 13 days allowed</p>
        </div>

        {/* Budget Field */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">💰 What is your budget for this trip?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div 
                key={index}
                onClick={() => OnSelectBudget(item)}
                className={`cursor-pointer p-4 border rounded-xl hover:shadow-md transition-all ${
                  formData.budget?.id === item.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <h2 className="text-2xl">{item.icon}</h2>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <h2 className="text-sm text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-8">
          <h2 className="text-xl my-2 font-medium">🌟 Popular Destinations</h2>
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
                className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
              >
                {destination}
              </button>
            ))}
          </div>
        </div>

        {/* Create Trip Button */}
        <div className="mt-8">
          <Button 
            onClick={handleCreateTrip}
            disabled={isCreatingTrip}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingTrip ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Your Trip...
              </div>
            ) : (
              '✈️ Create My Trip'
            )}
          </Button>
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