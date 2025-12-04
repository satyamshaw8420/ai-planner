import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTrips } from '@/hooks/useFetchTrips';

const OfflineTrips = () => {
  const navigate = useNavigate();
  const { allTrips } = useFetchTrips();
  const [offlineTrips, setOfflineTrips] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });

  // Check if service worker is supported
  const isServiceWorkerSupported = 'serviceWorker' in navigator;

  // Load offline trips from localStorage on component mount
  useEffect(() => {
    const savedOfflineTrips = JSON.parse(localStorage.getItem('offlineTrips') || '[]');
    setOfflineTrips(savedOfflineTrips);
    
    // Calculate storage usage
    updateStorageInfo();
  }, []);

  // Update storage information
  const updateStorageInfo = () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        setStorageInfo({
          used: usage || 0,
          total: quota || 0
        });
      });
    }
  };

  // Save trip for offline access
  const saveTripOffline = async (trip) => {
    // Set download progress
    setDownloadProgress(prev => ({ ...prev, [trip._id]: 0 }));
    
    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setDownloadProgress(prev => ({ ...prev, [trip._id]: i }));
      }
      
      // Add to offline trips
      const updatedOfflineTrips = [...offlineTrips, trip];
      setOfflineTrips(updatedOfflineTrips);
      localStorage.setItem('offlineTrips', JSON.stringify(updatedOfflineTrips));
      
      // Update storage info
      updateStorageInfo();
    } catch (error) {
      console.error('Error saving trip offline:', error);
    } finally {
      // Remove progress after completion
      setTimeout(() => {
        setDownloadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[trip._id];
          return newProgress;
        });
      }, 1000);
    }
  };

  // Remove trip from offline storage
  const removeOfflineTrip = (tripId) => {
    const updatedOfflineTrips = offlineTrips.filter(trip => trip._id !== tripId);
    setOfflineTrips(updatedOfflineTrips);
    localStorage.setItem('offlineTrips', JSON.stringify(updatedOfflineTrips));
    updateStorageInfo();
  };

  // Format storage size
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Register service worker for offline capability
  const registerServiceWorker = async () => {
    if (!isServiceWorkerSupported) {
      alert('Service workers are not supported in your browser.');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Offline Trip Access</h1>
          <p className="text-gray-600">Download your trips for offline viewing</p>
        </div>

        {/* Storage Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Storage Information</h3>
              <p className="text-gray-600">
                {formatBytes(storageInfo.used)} of {formatBytes(storageInfo.total)} used
              </p>
            </div>
            <div className="w-full md:w-1/2 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(storageInfo.used / storageInfo.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Offline Trips Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Offline Trips</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {offlineTrips.length} trips downloaded
            </span>
          </div>
          
          {offlineTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineTrips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {trip.userSelection.location.label}
                      </h3>
                      <button 
                        onClick={() => removeOfflineTrip(trip._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
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
                        onClick={() => navigate(`/trip-details/${trip._id}`)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        View Offline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">📥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Offline Trips</h3>
              <p className="text-gray-600 mb-6">Download trips from your history for offline access.</p>
            </div>
          )}
        </div>

        {/* Available Trips to Download */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Trips</h2>
          
          {allTrips && allTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrips.map((trip) => {
                const isDownloaded = offlineTrips.some(t => t._id === trip._id);
                const isDownloading = downloadProgress[trip._id] !== undefined;
                
                return (
                  <div 
                    key={trip._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {trip.userSelection.location.label}
                        </h3>
                        {isDownloaded && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Downloaded
                          </span>
                        )}
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
                        {isDownloading ? (
                          <div className="w-full">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Downloading...</span>
                              <span>{downloadProgress[trip._id]}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${downloadProgress[trip._id]}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => saveTripOffline(trip)}
                            disabled={isDownloaded}
                            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
                              isDownloaded 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isDownloaded ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Saved Offline
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Save for Offline
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
              <p className="text-gray-600 mb-6">Create some trips to download for offline access!</p>
              <button
                onClick={() => navigate('/create-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-black! font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create New Trip
              </button>
            </div>
          )}
        </div>

        {/* Service Worker Registration */}
        {isServiceWorkerSupported && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Offline Capability</h3>
                <p className="text-gray-600 mb-4">
                  Enable offline access by registering our service worker. This will allow you to access 
                  the app even when you're not connected to the internet.
                </p>
                <button
                  onClick={registerServiceWorker}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Enable Offline Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineTrips;