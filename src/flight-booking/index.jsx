import React from 'react';
import FlightBooking from '@/components/custom/FlightBooking';
import FlightVisualization from '@/components/custom/FlightVisualization';

const FlightBookingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
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