import React, { useRef, useState, useEffect } from 'react';
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
    if (allTrips && allTrips.length > 0) {
      // Create a map to count trips per destination
      const destinationMap = {};
      
      allTrips.forEach(trip => {
        const location = trip.userSelection?.location?.label;
        if (location) {
          if (!destinationMap[location]) {
            // Get coordinates for the location
            const coords = getLocationCoordinates(location);
            
            destinationMap[location] = {
              name: location,
              tripCount: 0,
              lat: coords ? coords.lat : (Math.random() - 0.5) * 180, // Fallback to random if not found
              lng: coords ? coords.lng : (Math.random() - 0.5) * 360,
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
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trip Destinations Globe</h1>
          <p className="text-blue-200">Interactive 3D visualization of your travel destinations</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          <div className="h-[500px] w-full relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <AnimatedGlobe 
                destinations={tripsDestinations} 
                onDestinationClick={handleDestinationClick} 
              />
            </Canvas>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 className="font-bold mb-2">Legend</h3>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Your Destinations</span>
              </div>
              <div className="text-xs text-gray-300 mt-2">
                Click and drag to rotate • Scroll to zoom
              </div>
            </div>
            
            {/* Controls hint */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Hover over markers for labels</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Destination Details Panel */}
        {selectedDestination && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedDestination.name}</h2>
              <button 
                onClick={handleCloseDetails}
                className="text-white/70 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                <p className="text-blue-200">Latitude: {selectedDestination.lat.toFixed(4)}</p>
                <p className="text-blue-200">Longitude: {selectedDestination.lng.toFixed(4)}</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Statistics</h3>
                <p className="text-blue-200">Trips planned: {selectedDestination.tripCount || 'N/A'}</p>
                <p className="text-blue-200">Popular season: Summer</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Actions</h3>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors mb-2">
                  Plan New Trip
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors">
                  View Past Trips
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
            <div className="text-3xl font-bold">{tripsDestinations.length}</div>
            <div className="text-blue-100">Destinations</div>
          </div>
          <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-xl p-5 text-white">
            <div className="text-3xl font-bold">
              {tripsDestinations.reduce((sum, dest) => sum + (dest.tripCount || 0), 0)}
            </div>
            <div className="text-purple-100">Total Trips</div>
          </div>
          <div className="bg-linear-to-r from-green-600 to-teal-600 rounded-xl p-5 text-white">
            <div className="text-3xl font-bold">
              {Math.round(tripsDestinations.reduce((sum, dest) => sum + dest.lat, 0) / tripsDestinations.length) || 'N/A'}
            </div>
            <div className="text-green-100">Avg Latitude</div>
          </div>
          <div className="bg-linear-to-r from-yellow-600 to-orange-600 rounded-xl p-5 text-white">
            <div className="text-3xl font-bold">
              {Math.round(tripsDestinations.reduce((sum, dest) => sum + dest.lng, 0) / tripsDestinations.length) || 'N/A'}
            </div>
            <div className="text-yellow-100">Avg Longitude</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobeVisualization;