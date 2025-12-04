import React, { useState, useEffect } from 'react';
import FlightBooking from '@/components/custom/FlightBooking';
import FlightVisualization from '@/components/custom/FlightVisualization';

const FlightBookingPage = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Set animation as complete after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 relative z-10">
        
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