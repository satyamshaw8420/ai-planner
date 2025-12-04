import React from 'react'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate();
  
  // Function to trigger Google Sign-In
  const handleGoogleSignIn = () => {
    // Dispatch a custom event that the CreateTrip component can listen for
    window.dispatchEvent(new CustomEvent('open-google-signin'));
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <div className="flex items-center gap-8 ml-0">
        <img src="/logo.svg" alt="TravelEase Logo" style={{ width: '100px', height: 'auto' }} />
        <div className="hidden md:flex gap-10">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/create-trip')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Create Trip
          </button>
          <button 
            onClick={() => navigate('/trip-history')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            My Trips
          </button>
          <button 
            onClick={() => navigate('/globe')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Destinations
          </button>
          <button 
            onClick={() => navigate('/compare')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Compare
          </button>
          <button 
            onClick={() => navigate('/offline')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Offline
          </button>
          <button 
            onClick={() => navigate('/weather')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Weather
          </button>
          <button 
            onClick={() => navigate('/social')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Community
          </button>
          <button 
            onClick={() => navigate('/verify-data')} 
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Verify Data
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleGoogleSignIn}>Log In</Button>
        <Button onClick={handleGoogleSignIn}>Sign Up</Button>
      </div>
    </div>
  )
}

export default Header