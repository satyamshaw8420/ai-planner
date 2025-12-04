import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import Unsplash service
import { fetchUnsplashImages } from '@/service/unsplashService';

const PremiumHero = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Background images state
  const [backgroundImages, setBackgroundImages] = useState([
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
  ]);

  const features = [
    {
      icon: "🤖",
      title: "AI Travel Planning",
      description: "Smart itineraries crafted by artificial intelligence"
    },
    {
      icon: "🌍",
      title: "Global Destinations",
      description: "Explore thousands of worldwide locations"
    },
    {
      icon: "👥",
      title: "Group Collaboration",
      description: "Plan trips together with friends and family"
    },
    {
      icon: "🌤️",
      title: "Weather Integration",
      description: "Real-time forecasts for perfect planning"
    }
  ];

  // Fetch dynamic background images from Unsplash on component mount
  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        // Fetch travel-related images from Unsplash
        const images = await fetchUnsplashImages('travel destinations', 5);
        
        if (images && images.length > 0) {
          // Transform the images to match our expected format
          const formattedImages = images.map(img => ({
            url: img.url
          }));
          
          setBackgroundImages(formattedImages);
        }
      } catch (error) {
        console.error('Error fetching background images from Unsplash:', error);
        // Keep using the default images if API fails
      }
    };

    fetchBackgroundImages();
  }, []);

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, [backgroundImages.length]);

  // Auto-slide features every 4 seconds
  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(featureInterval);
  }, [features.length]);

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background with zoom-in effect only */}
      <div 
        className="relative bg-cover bg-center h-[600px] flex items-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${backgroundImages[currentBgIndex].url}')`,
          transform: 'scale(1.1)',
          transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-down">
              Discover Your Perfect Journey
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl mx-auto animate-fade-in-up">
              Effortless travel planning with AI-powered itineraries, real-time collaboration, and personalized recommendations.
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="!bg-white/80 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-md"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Powerful Travel Features</h2>
            <p className="mt-4 text-lg text-gray-600">Everything you need for the perfect trip</p>
          </div>
          
          {/* Carousel container */}
          <div className="relative overflow-hidden py-4">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / features.length)}%)` }}
            >
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                >
                  <div className="bg-white rounded-xl shadow-sm p-6 h-full hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
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

export default PremiumHero;