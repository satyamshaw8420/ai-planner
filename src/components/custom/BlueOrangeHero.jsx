import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlueOrangeHero = () => {
  const navigate = useNavigate();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

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

  const features = [
    {
      title: "AI Travel Planner",
      description: "Intelligent trip planning powered by artificial intelligence",
      icon: "🤖"
    },
    {
      title: "Group Trip Creator",
      description: "Plan amazing group adventures with friends and family",
      icon: "👥"
    },
    {
      title: "Live Weather & Compare Tool",
      description: "Real-time weather updates and easy trip comparisons",
      icon: "🌤️"
    },
    {
      title: "Community Travel Feed",
      description: "Connect with fellow travelers and share experiences",
      icon: "🌐"
    },
    {
      title: "Destination Explorer",
      description: "Discover new places with our interactive globe",
      icon: "🌎"
    },
    {
      title: "Offline Mode Support",
      description: "Access your trips anytime, anywhere, even offline",
      icon: "📱"
    }
  ];

  const sloganText = "Travel Together. Dream Bigger.";

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(bgInterval);
  }, [backgroundImages.length]);

  // Auto-slide features every 3 seconds
  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(featureInterval);
  }, [features.length]);

  // Mark animation as complete after 3 seconds (longer for smoother experience)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Get random animation class for each letter
  const getRandomAnimationClass = (index) => {
    const animations = [
      'animate-drop-from-top',
      'animate-drop-from-left',
      'animate-drop-from-right',
      'animate-drop-from-bottom'
    ];
    return animations[index % animations.length];
  };

  return (
    <div className="relative overflow-hidden animate-fade-down animate-duration-500">
      {/* Background with carousel and zoom-in effect only */}
      <div 
        className="relative bg-cover bg-center h-[600px] flex items-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${backgroundImages[currentBgIndex].url}')`,
          transform: 'scale(1.1)',
          transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {!animationComplete ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 flex flex-wrap justify-center">
                {sloganText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${getRandomAnimationClass(index)} animation-delay-${index % 10}`}
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      display: 'inline-block'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </h1>
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in-smooth">
                Travel Together. Dream Bigger.
              </h1>
            )}
            <p className="text-xl text-gray-100 mb-10 max-w-2xl mx-auto animate-fade-in-up-smooth">
              Effortless travel planning with AI-powered itineraries, real-time collaboration, and personalized recommendations.
            </p>
            <button
              onClick={() => navigate('/create-trip')}
              className="!bg-white/80 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-lg"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>

      {/* Feature Carousel */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Travel Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need for the perfect trip</p>
          </div>
          
          {/* Carousel container */}
          <div className="relative overflow-hidden py-4">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / Math.min(features.length, 3))}%)` }}
            >
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                >
                  <div className="bg-gray-50 rounded-xl p-6 h-full border border-gray-100 hover:shadow-md transition-shadow duration-500">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(features.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
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
        
        @keyframes fade-in-up-smooth {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-smooth {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes drop-from-top {
          0% {
            opacity: 0;
            transform: translateY(-150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes drop-from-left {
          0% {
            opacity: 0;
            transform: translateX(-150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes drop-from-right {
          0% {
            opacity: 0;
            transform: translateX(150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes drop-from-bottom {
          0% {
            opacity: 0;
            transform: translateY(150px);
          }
          70% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out forwards;
        }
        
        .animate-fade-in-up-smooth {
          animation: fade-in-up-smooth 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-smooth {
          animation: fade-in-smooth 1s ease-in-out forwards;
          opacity: 0;
        }
        
        .animate-drop-from-top {
          animation: drop-from-top 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-left {
          animation: drop-from-left 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-right {
          animation: drop-from-right 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animate-drop-from-bottom {
          animation: drop-from-bottom 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          opacity: 0;
        }
        
        .animation-delay-0 { animation-delay: 0s; }
        .animation-delay-1 { animation-delay: 0.15s; }
        .animation-delay-2 { animation-delay: 0.3s; }
        .animation-delay-3 { animation-delay: 0.45s; }
        .animation-delay-4 { animation-delay: 0.6s; }
        .animation-delay-5 { animation-delay: 0.75s; }
        .animation-delay-6 { animation-delay: 0.9s; }
        .animation-delay-7 { animation-delay: 1.05s; }
        .animation-delay-8 { animation-delay: 1.2s; }
        .animation-delay-9 { animation-delay: 1.35s; }
      `}</style>
    </div>
  );
};

export default BlueOrangeHero;