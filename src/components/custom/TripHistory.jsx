import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { useShareTrip } from '@/hooks/useShareTrip';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TripHistory = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const { generateShareLink, copyToClipboard } = useShareTrip();
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sharingTripId, setSharingTripId] = useState(null);

  useEffect(() => {
    if (allTrips) {
      let filtered = allTrips;
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(trip => 
          trip.userSelection.location.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply date filter
      if (filter !== 'all') {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        filtered = filtered.filter(trip => {
          const tripDate = trip.createdAt;
          switch (filter) {
            case 'today':
              return (now - tripDate) < oneDay;
            case 'week':
              return (now - tripDate) < 7 * oneDay;
            case 'month':
              return (now - tripDate) < 30 * oneDay;
            default:
              return true;
          }
        });
      }
      
      setFilteredTrips(filtered);
    }
  }, [allTrips, searchTerm, filter]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBudgetLabel = (budgetId) => {
    const budgets = ['Cheap', 'Moderate', 'Luxury'];
    return budgets[budgetId - 1] || 'Unknown';
  };

  const getTravelersLabel = (travelersId) => {
    const travelers = ['Just Me', 'A Couple', 'Family', 'Friends'];
    return travelers[travelersId - 1] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trip History</h1>
          <p className="text-gray-600">View and manage all your planned trips</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-lg transition-all !bg-gradient-to-r !from-blue-500 !to-purple-500 text-white shadow-md ${
                  filter === 'all' 
                    ? '' 
                    : '!bg-gray-200 text-gray-800 hover:!bg-gray-300 focus:outline-none focus:ring-0'
                }`}
                onClick={() => setFilter('all')}
              >
                All Time
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-all !bg-gradient-to-r !from-blue-500 !to-purple-500 text-white shadow-md ${
                  filter === 'today' 
                    ? '' 
                    : '!bg-gray-200 text-gray-800 hover:!bg-gray-300 focus:outline-none focus:ring-0'
                }`}
                onClick={() => setFilter('today')}
              >
                Today
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-all !bg-gradient-to-r !from-blue-500 !to-purple-500 text-white shadow-md ${
                  filter === 'week' 
                    ? '' 
                    : '!bg-gray-200 text-gray-800 hover:!bg-gray-300 focus:outline-none focus:ring-0'
                }`}
                onClick={() => setFilter('week')}
              >
                This Week
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-all !bg-gradient-to-r !from-blue-500 !to-purple-500 text-white shadow-md ${
                  filter === 'month' 
                    ? '' 
                    : '!bg-gray-200 text-gray-800 hover:!bg-gray-300 focus:outline-none focus:ring-0'
                }`}
                onClick={() => setFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Trip Cards Grid */}
        {filteredTrips && filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, rotateY: 5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden cursor-pointer transform-gpu border border-white/50"
                onClick={() => navigate(`/trip-details/${trip._id}`)}
              >
                <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white text-center px-4">
                      {trip.userSelection.location.label}
                    </h3>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow">
                    {trip.userSelection.days} Days
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Created on</p>
                      <p className="font-semibold">{formatDate(trip.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Budget</p>
                      <p className="font-semibold">{getBudgetLabel(trip.userSelection.budget)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Travelers</p>
                      <p className="font-semibold">{getTravelersLabel(trip.userSelection.travelers)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {trip.userSelection.days}
                        </span>
                      </div>
                      <span className="text-gray-600">Days</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trip-details/${trip._id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingTripId(trip._id === sharingTripId ? null : trip._id);
                        generateShareLink(trip._id);
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
                    >
                      Share
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-white/50">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Trips Yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-2 px-6 rounded-lg hover:shadow-md transition-all"
              >
                Create Your First Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripHistory;