import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TripComparison = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  // Toggle trip selection
  const toggleTripSelection = (tripId) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId) 
        : [...prev, tripId]
    );
  };

  // Prepare comparison data when selected trips change
  useEffect(() => {
    if (selectedTrips.length >= 2 && allTrips) {
      const tripsToCompare = allTrips.filter(trip => 
        selectedTrips.includes(trip._id)
      );

      // Extract comparison metrics
      const destinations = tripsToCompare.map(trip => trip.userSelection.location.label);
      const days = tripsToCompare.map(trip => parseInt(trip.userSelection.days));
      const budgets = tripsToCompare.map(trip => {
        const budgetLabels = ['Cheap', 'Moderate', 'Luxury'];
        return budgetLabels[trip.userSelection.budget - 1] || 'Unknown';
      });
      const travelers = tripsToCompare.map(trip => {
        const travelerLabels = ['Just Me', 'A Couple', 'Family', 'Friends'];
        return travelerLabels[trip.userSelection.travelers - 1] || 'Unknown';
      });

      // Calculate approximate costs (this is simulated - in reality, you'd extract from tripData)
      const costs = days.map((day, index) => {
        const budgetMultiplier = tripsToCompare[index].userSelection.budget;
        const travelerCount = tripsToCompare[index].userSelection.travelers;
        // Simplified cost calculation
        return day * (budgetMultiplier * 100) * (travelerCount || 1);
      });

      setComparisonData({
        destinations,
        days,
        budgets,
        travelers,
        costs,
        trips: tripsToCompare
      });
    } else {
      setComparisonData(null);
    }
  }, [selectedTrips, allTrips]);

  // Chart data configurations
  const barChartData = comparisonData ? {
    labels: comparisonData.destinations,
    datasets: [
      {
        label: 'Number of Days',
        data: comparisonData.days,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Estimated Cost ($)',
        data: comparisonData.costs,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  } : null;

  const pieChartData = comparisonData ? {
    labels: comparisonData.budgets,
    datasets: [
      {
        label: 'Budget Distribution',
        data: comparisonData.budgets.map(() => 1), // Equal distribution for pie chart
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const getBudgetLabel = (budgetId) => {
    const budgets = ['Cheap', 'Moderate', 'Luxury'];
    return budgets[budgetId - 1] || 'Unknown';
  };

  const getTravelersLabel = (travelersId) => {
    const travelers = ['Just Me', 'A Couple', 'Family', 'Friends'];
    return travelers[travelersId - 1] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Trip Comparison</h1>
          <p className="text-gray-600">Compare your travel plans side-by-side</p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-blue-100 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">How to Compare Trips</h3>
              <p className="text-gray-600">
                Select at least two trips from your history to compare them. You can compare destinations, durations, budgets, and estimated costs.
              </p>
            </div>
          </div>
        </div>

        {/* Trip Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Trips to Compare</h2>
          
          {allTrips && allTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrips.map((trip) => (
                <div 
                  key={trip._id}
                  onClick={() => toggleTripSelection(trip._id)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl ${
                    selectedTrips.includes(trip._id) 
                      ? 'ring-4 ring-blue-500 border-blue-500' 
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {trip.userSelection.location.label}
                      </h3>
                      <div className="flex items-center">
                        {selectedTrips.includes(trip._id) ? (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{trip.userSelection.days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">{getBudgetLabel(trip.userSelection.budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travelers:</span>
                        <span className="font-medium">{getTravelersLabel(trip.userSelection.travelers)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trip-details/${trip._id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                      >
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">Create some trips to start comparing!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {comparisonData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Comparison Results</h2>
              <div className="text-sm text-gray-600">
                Comparing {selectedTrips.length} trips
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{comparisonData.destinations.length}</div>
                <div className="text-blue-100">Destinations</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">
                  {Math.max(...comparisonData.days)}
                </div>
                <div className="text-green-100">Longest Trip (days)</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">
                  ${Math.max(...comparisonData.costs).toLocaleString()}
                </div>
                <div className="text-yellow-100">Highest Estimated Cost</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">
                  {Math.round(comparisonData.costs.reduce((a, b) => a + b, 0) / comparisonData.costs.length)}
                </div>
                <div className="text-purple-100">Avg. Cost Per Day</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Duration & Cost Comparison</h3>
                <Bar 
                  data={barChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Duration vs Estimated Cost'
                      }
                    }
                  }} 
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Distribution</h3>
                <Pie 
                  data={pieChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      title: {
                        display: true,
                        text: 'Budget Categories'
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="mt-8 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Comparison</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travelers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonData.trips.map((trip, index) => (
                    <tr key={trip._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{trip.userSelection.location.label}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{trip.userSelection.days} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getBudgetLabel(trip.userSelection.budget)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTravelersLabel(trip.userSelection.travelers)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${comparisonData.costs[index].toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {selectedTrips.length < 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Trips to Compare</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose at least two trips from your history to see a detailed comparison of destinations, durations, budgets, and estimated costs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create New Trip
              </button>
              <button
                onClick={() => navigate('/trip-history')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                View All Trips
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripComparison;