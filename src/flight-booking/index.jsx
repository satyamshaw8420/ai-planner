import React, { useState, useEffect } from 'react';
import FlightBooking from '@/components/custom/FlightBooking';
import FlightVisualization from '@/components/custom/FlightVisualization';

const FlightBookingPage = () => {
  const [planeImages, setPlaneImages] = useState([]);
  const [featuredPlane, setFeaturedPlane] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Fetch additional plane images for the page background
  useEffect(() => {
    const fetchPlaneImages = async () => {
      try {
        // Using Unsplash API with a search query for "airplane"
        // Note: In a production app, you would use your own API key
        const response = await fetch(
          'https://api.unsplash.com/search/photos?query=airplane&per_page=8&client_id=YOUR_UNSPLASH_ACCESS_KEY&orientation=landscape'
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Extract image URLs from the response
          const imageUrls = data.results.map(photo => ({
            id: photo.id,
            url: photo.urls.regular,
            alt: photo.alt_description || 'Airplane'
          }));
          
          setPlaneImages(imageUrls);
          // Set the first image as the featured plane
          setFeaturedPlane(imageUrls[0]);
        }
      } catch (error) {
        console.error('Error fetching plane images:', error);
      }
    };

    fetchPlaneImages();
    
    // Set animation as complete after 1.5 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative plane images */}
      {planeImages.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {planeImages.map((plane, index) => (
            <div 
              key={plane.id}
              className="absolute opacity-5"
              style={{
                top: `${10 + (index * 15)}%`,
                left: `${(index % 3) * 30}%`,
                transform: `rotate(${index * 15}deg)`,
                width: '200px',
                height: '200px'
              }}
            >
              <img 
                src={plane.url} 
                alt={plane.alt} 
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Prominent Plane Image Header */}
        {featuredPlane && (
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl transform transition-transform duration-500 hover:scale-110">
              <img 
                src={featuredPlane.url} 
                alt={featuredPlane.alt} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Book Your Flight
          </h1>
          <p className="text-gray-600">
            Find and book the best flights for your trip
          </p>
        </div>
        
        <div className="mb-8">
          <FlightVisualization />
        </div>
        
        <FlightBooking />
      </div>
    </div>
  );
};

export default FlightBookingPage;