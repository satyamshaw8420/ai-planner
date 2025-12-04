import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FiLogOut } from 'react-icons/fi';
import { toast } from 'sonner';
import GoogleLoginModal from './GoogleLoginModal';

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Background images with zoom in effect only
  const backgroundImages = [
    {
      url: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      url: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    },
    {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
    }
  ];

  // Check if user is logged in
  useEffect(() => {
    const checkUserStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    };

    // Check initial status
    checkUserStatus();

    // Listen for storage changes (real-time updates)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUserStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for real-time updates within the same tab)
    const handleUserStatusChange = () => {
      checkUserStatus();
    };

    window.addEventListener('user-status-changed', handleUserStatusChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-status-changed', handleUserStatusChange);
    };
  }, []);

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, [backgroundImages.length]);

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    setUser(null);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('user-status-changed'));
    
    // Show logout success message
    toast.success("You have been logged out successfully");
  };

  const handleGoogleSignIn = () => {
    // Show the login modal
    setShowLoginModal(true);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background with zoom-in effect only */}
      <div 
        className="absolute inset-0 bg-cover bg-center flex items-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${backgroundImages[currentBgIndex].url}')`,
          transform: 'scale(1.1)',
          transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 min-h-screen flex items-center">
        <div className="text-center w-full">
          <div className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            <div className="block overflow-hidden">
              <span className="inline-block animate-slide-in-left-slow">Plan Your Perfect</span>
            </div>
            <div className="block overflow-hidden">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 animate-slide-in-right-slow">Travel Experience</span>
            </div>
          </div>
          <p className="mt-6 max-w-lg mx-auto text-xl text-gray-100 animate-fade-in-up">
            Create personalized travel itineraries powered by AI. Discover destinations, plan activities, and make unforgettable memories.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/create-trip')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Start Planning Your Trip
            </button>
            <button
              onClick={() => navigate('/globe')}
              className="px-8 py-4 bg-white/80 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-white/50 hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-300 text-lg backdrop-blur-sm"
            >
              Explore Destinations
            </button>
          </div>
          
          {/* Prominent Login/Logout Button */}
          <div className="mt-8">
            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 font-medium"
                title={`Logout ${user.fullname || user.email || 'user'}`}
              >
                <FiLogOut className="text-xl" />
                Logout
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 font-medium"
                title="Sign in with Google"
              >
                <FcGoogle className="text-xl" />
                <span>Login with Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Login Modal */}
      <GoogleLoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      {/* Custom animations */}
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left-slow {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right-slow {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-left-slow {
          animation: slide-in-left-slow 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.1s;
        }
        
        .animate-slide-in-right-slow {
          animation: slide-in-right-slow 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: 0.3s;
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Hero;