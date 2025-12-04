import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { FiLogOut } from 'react-icons/fi'

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleGoogleSignIn = () => {
    window.dispatchEvent(new CustomEvent('open-google-signin'));
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5 w-full'>
      <div className="flex items-center gap-8 ml-0">
        <img src="/logo.svg" alt="TravelEase Logo" className="h-8 w-auto" />
        <div className="hidden md:flex gap-4"> {/* Reduced gap from gap-6 to gap-4 */}
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/create-trip')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Create Trip
          </button>
          <button 
            onClick={() => navigate('/trip-history')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            My Trips
          </button>
          <button 
            onClick={() => navigate('/globe')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Destinations
          </button>
          <button 
            onClick={() => navigate('/compare')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Compare
          </button>
          <button 
            onClick={() => navigate('/offline')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Offline
          </button>
          <button 
            onClick={() => navigate('/weather')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Weather
          </button>
          <button 
            onClick={() => navigate('/social')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Community
          </button>
          <button 
            onClick={() => navigate('/verify-data')} 
            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
          >
            Verify Data
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-white text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center w-10 h-10 border border-gray-300"
            title="Logout"
          >
            <FiLogOut className="text-xl" />
          </button>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="bg-white text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center w-10 h-10 border border-gray-300"
            title="Sign in with Google"
          >
            <FcGoogle className="text-xl" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Header