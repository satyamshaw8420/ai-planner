import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { getLocationCoordinates, getRandomColor } from '@/utils/geocodeHelper';

// Convert lat/lng to 3D position on sphere
const latLngToPosition = (lat, lng, radius = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
};

// Realistic Earth Globe Component
const RealisticEarth = () => {
  // Load Earth textures
  const [earthTexture, bumpTexture, specularTexture] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
  ]);
  
  const earthRef = useRef();
  
  // Rotate the Earth slowly
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <Sphere ref={earthRef} args={[2, 64, 64]}>
      <meshPhongMaterial
        map={earthTexture}
        bumpMap={bumpTexture}
        bumpScale={0.05}
        specularMap={specularTexture}
        specular={new THREE.Color('grey')}
        shininess={5}
      />
    </Sphere>
  );
};

// Cloud Layer Component
const CloudLayer = () => {
  const [cloudTexture] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);
  
  const cloudsRef = useRef();
  
  // Rotate clouds slightly faster than Earth for a natural effect
  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0025;
    }
  });
  
  return (
    <Sphere ref={cloudsRef} args={[2.02, 64, 64]}>
      <meshPhongMaterial
        map={cloudTexture}
        transparent={true}
        opacity={0.4}
      />
    </Sphere>
  );
};

// Atmospheric Glow Component
const AtmosphericGlow = () => {
  const glowRef = useRef();
  
  return (
    <Sphere ref={glowRef} args={[2.1, 64, 64]}>
      <meshBasicMaterial
        color="#3399ff"
        transparent={true}
        opacity={0.1}
      />
    </Sphere>
  );
};

// Floating Particles Component
const FloatingParticles = ({ count = 200 }) => {
  const meshRef = useRef();
  
  // Create particle positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 2 * Math.PI;
      const u = Math.random() * 2 - 1;
      const r = Math.cbrt(Math.random()) * 4;
      const x = r * Math.sqrt(1 - u * u) * Math.cos(t);
      const y = r * Math.sqrt(1 - u * u) * Math.sin(t);
      const z = r * u;
      
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#88ccff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Animated Globe Component
const AnimatedGlobe = ({ destinations, onDestinationClick }) => {
  const [hoveredDestination, setHoveredDestination] = useState(null);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      
      {/* Realistic Earth with textures */}
      <RealisticEarth />
      
      {/* Cloud layer */}
      <CloudLayer />
      
      {/* Atmospheric glow */}
      <AtmosphericGlow />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Destination markers */}
      {destinations.map((destination, index) => {
        const position = latLngToPosition(destination.lat, destination.lng);
        const isHovered = hoveredDestination === index;
        
        return (
          <group key={index}>
            {/* Marker sphere */}
            <Sphere
              position={position}
              args={[isHovered ? 0.15 : 0.1, 16, 16]}
              onClick={() => onDestinationClick(destination)}
              onPointerOver={() => setHoveredDestination(index)}
              onPointerOut={() => setHoveredDestination(null)}
            >
              <meshStandardMaterial 
                color={destination.color} 
                emissive={destination.color}
                emissiveIntensity={isHovered ? 0.5 : 0.2}
              />
            </Sphere>
            
            {/* Label for hovered destination */}
            {isHovered && (
              <Text
                position={[position[0] * 1.2, position[1] * 1.2, position[2] * 1.2]}
                fontSize={0.15}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {destination.name}
              </Text>
            )}
          </group>
        );
      })}
      
      {/* Camera controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
      />
    </>
  );
};

// Main Globe Visualization Component
const GlobeVisualization = () => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [tripsDestinations, setTripsDestinations] = useState([]);
  const { allTrips } = useFetchTrips();
  
  // Extract unique destinations from trips
  useEffect(() => {
    if (allTrips.length > 0) {
      // Create a map to count trips per destination
      const destinationMap = {};
      
      allTrips.forEach(trip => {
        // Defensive check for trip structure
        if (!trip || !trip.userSelection) return;
        
        const location = trip.userSelection.location?.label;
        if (location) {
          if (!destinationMap[location]) {
            // Get coordinates for the location
            const coords = getLocationCoordinates(location);
            
            destinationMap[location] = {
              name: location,
              tripCount: 0,
              lat: coords ? coords.lat : 0, // Default to equator if not found
              lng: coords ? coords.lng : 0, // Default to prime meridian if not found
              color: getRandomColor()
            };
          }
          destinationMap[location].tripCount++;
        }
      });
      
      // Convert map to array
      const destinations = Object.values(destinationMap);
      setTripsDestinations(destinations);
    }
  }, [allTrips]);
  
  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination);
  };
  
  const handleCloseDetails = () => {
    setSelectedDestination(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            Trip Destinations Globe
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Interactive 3D visualization of your travel destinations
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-blue-500/20">
          <div className="h-[500px] w-full relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <AnimatedGlobe 
                destinations={tripsDestinations} 
                onDestinationClick={handleDestinationClick} 
              />
            </Canvas>
            
            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-lg rounded-xl p-4 text-white border border-white/10 shadow-lg animate-slide-up">
              <h3 className="font-bold mb-3 text-lg">Legend</h3>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-base">Your Destinations</span>
              </div>
              <div className="text-sm text-gray-300 mt-3 pt-3 border-t border-white/10">
                Click and drag to rotate • Scroll to zoom
              </div>
            </div>
            
            {/* Controls hint */}
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-lg rounded-xl p-3 text-white border border-white/10 shadow-lg animate-fade-in delay-300">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Hover over markers for labels</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Destination Details Panel */}
        {selectedDestination && (
          <div className="mt-8 bg-gradient-to-br from-gray-800/80 to-blue-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedDestination.name}</h2>
                <p className="text-blue-300">Detailed information about this destination</p>
              </div>
              <button 
                onClick={handleCloseDetails}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Location</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Latitude</p>
                    <p className="text-blue-200 font-mono">{selectedDestination.lat.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Longitude</p>
                    <p className="text-blue-200 font-mono">{selectedDestination.lng.toFixed(6)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Statistics</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Trips planned</p>
                    <p className="text-purple-200 text-2xl font-bold">{selectedDestination.tripCount || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Popular season</p>
                    <p className="text-purple-200">Summer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Actions</h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 font-medium">
                    Plan New Trip
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl transition-all duration-300 border border-white/20 font-medium">
                    View Past Trips
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Destinations</h3>
            </div>
            <div className="text-4xl font-bold mt-2">{tripsDestinations.length}</div>
            <div className="text-blue-100 text-sm mt-1">Unique places visited</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Total Trips</h3>
            </div>
            <div className="text-4xl font-bold mt-2">
              {tripsDestinations.reduce((sum, dest) => sum + (dest.tripCount || 0), 0)}
            </div>
            <div className="text-purple-100 text-sm mt-1">Adventures planned</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Avg Latitude</h3>
            </div>
            <div className="text-4xl font-bold mt-2">
              {Math.round(tripsDestinations.reduce((sum, dest) => sum + dest.lat, 0) / tripsDestinations.length) || 'N/A'}
            </div>
            <div className="text-green-100 text-sm mt-1">Northern/Southern hemisphere</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Avg Longitude</h3>
            </div>
            <div className="text-4xl font-bold mt-2">
              {Math.round(tripsDestinations.reduce((sum, dest) => sum + dest.lng, 0) / tripsDestinations.length) || 'N/A'}
            </div>
            <div className="text-yellow-100 text-sm mt-1">Eastern/Western hemisphere</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobeVisualization;

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-in-up {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slide-up {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }
  
  .delay-300 {
    animation-delay: 0.3s;
  }
  
  .delay-500 {
    animation-delay: 0.5s;
  }
`;
document.head.appendChild(style);