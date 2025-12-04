import React, { useRef, useEffect, useState } from 'react';

const FlightVisualization = () => {
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [planeImages, setPlaneImages] = useState([]);
  const [featuredPlane, setFeaturedPlane] = useState(null);

  // Fetch plane images from Unsplash
  useEffect(() => {
    const fetchPlaneImages = async () => {
      try {
        // Using Unsplash API with a search query for "airplane"
        // Note: In a production app, you would use your own API key
        const response = await fetch(
          'https://api.unsplash.com/search/photos?query=airplane&per_page=15&client_id=YOUR_UNSPLASH_ACCESS_KEY&orientation=landscape'
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Extract image URLs from the response
          const imageUrls = data.results.map(photo => ({
            id: photo.id,
            url: photo.urls.regular,
            thumb: photo.urls.thumb,
            alt: photo.alt_description || 'Airplane'
          }));
          
          setPlaneImages(imageUrls);
          // Set the first image as featured
          setFeaturedPlane(imageUrls[0]);
        }
      } catch (error) {
        console.error('Error fetching plane images:', error);
        // Fallback to canvas drawn planes if API fails
      }
    };

    fetchPlaneImages();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Animation variables
    let animationFrameId;
    const particles = [];
    let mainPlane = {
      x: -100,
      y: canvas.height / 2,
      size: 8,
      angle: 0,
      speed: 2,
      trail: []
    };
    
    // Create initial particles (background airplanes)
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 1 + 0.5,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.4 + 0.2
      });
    }
    
    // Draw airplane shape with 3D effect
    const drawAirplane = (x, y, size, angle, opacity, isMain = false) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      
      if (isMain) {
        // Main airplane with 3D effect
        // Airplane body with gradient
        const gradient = ctx.createLinearGradient(-size * 3, 0, size * 2, 0);
        gradient.addColorStop(0, '#1E40AF'); // Dark blue
        gradient.addColorStop(1, '#60A5FA'); // Light blue
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-size * 3, 0);
        ctx.lineTo(-size * 1.5, -size);
        ctx.lineTo(size * 2, 0);
        ctx.lineTo(-size * 1.5, size);
        ctx.closePath();
        ctx.fill();
        
        // Wings with shadow
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.moveTo(-size * 1.5, 0);
        ctx.lineTo(-size * 3, -size * 1.5);
        ctx.lineTo(-size * 0.5, -size * 0.8);
        ctx.lineTo(size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-size * 1.5, 0);
        ctx.lineTo(-size * 3, size * 1.5);
        ctx.lineTo(-size * 0.5, size * 0.8);
        ctx.lineTo(size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
        
        // Tail
        ctx.fillStyle = '#93C5FD';
        ctx.beginPath();
        ctx.moveTo(size * 1.5, 0);
        ctx.lineTo(size * 0.5, -size * 0.8);
        ctx.lineTo(size * 2, -size * 0.5);
        ctx.lineTo(size * 2.5, 0);
        ctx.lineTo(size * 2, size * 0.5);
        ctx.lineTo(size * 0.5, size * 0.8);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit window
        ctx.fillStyle = '#BFDBFE';
        ctx.beginPath();
        ctx.arc(-size * 2, 0, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Background airplanes (simpler)
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size * 2, -size);
        ctx.lineTo(-size * 2, size);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#93C5FD';
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(-size * 3, -size * 1.5);
        ctx.lineTo(-size * 3, size * 1.5);
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Draw trail effect
    const drawTrail = (trail) => {
      if (trail.length < 2) return;
      
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.3)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      
      ctx.stroke();
    };
    
    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#dbeafe');
      gradient.addColorStop(1, '#eff6ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 5; i++) {
        const x = (Date.now() / 50 + i * 200) % (canvas.width + 300) - 150;
        const y = 50 + i * 30;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 15, y - 10, 15, 0, Math.PI * 2);
        ctx.arc(x + 15, y + 10, 15, 0, Math.PI * 2);
        ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Update and draw background particles
      particles.forEach(particle => {
        // Move particle
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        
        // Reset particle if it goes off screen
        if (particle.x < -50 || particle.x > canvas.width + 50 || 
            particle.y < -50 || particle.y > canvas.height + 50) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.angle = Math.random() * Math.PI * 2;
        }
        
        // Draw airplane
        drawAirplane(particle.x, particle.y, particle.size, particle.angle, particle.opacity, false);
      });
      
      // Update main plane
      mainPlane.x += mainPlane.speed;
      
      // Add current position to trail
      mainPlane.trail.push({ x: mainPlane.x, y: mainPlane.y });
      if (mainPlane.trail.length > 20) {
        mainPlane.trail.shift();
      }
      
      // Reset main plane when it goes off screen
      if (mainPlane.x > canvas.width + 100) {
        mainPlane.x = -100;
        mainPlane.y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
        mainPlane.trail = [];
      }
      
      // Draw trail
      drawTrail(mainPlane.trail);
      
      // Draw main airplane
      drawAirplane(mainPlane.x, mainPlane.y, mainPlane.size, mainPlane.angle, 1, true);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      mainPlane.y = canvas.height / 2;
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0"
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center transition-all duration-500 ${isHovered ? 'scale-110' : ''}`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">✈️ Flight Booking</h3>
          <p className="text-gray-600">Find and book your next adventure</p>
        </div>
      </div>
      
      {/* Enhanced Featured Plane Image - Larger and More Prominent */}
      {featuredPlane && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transition-all duration-700 hover:scale-110" 
             style={{ animation: 'float 3s ease-in-out infinite' }}>
          <img 
            src={featuredPlane.url} 
            alt={featuredPlane.alt} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      )}
      
      {/* Display fetched plane images */}
      {planeImages.length > 0 && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {planeImages.slice(0, 3).map((plane, index) => (
            <div key={plane.id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-110 transition-transform duration-200">
              <img 
                src={plane.thumb} 
                alt={plane.alt} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Interactive elements */}
      <div className="absolute bottom-4 left-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
          Live Tracking
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
          100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default FlightVisualization;