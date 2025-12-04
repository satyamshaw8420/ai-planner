import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const DataVerification = () => {
  const [showData, setShowData] = useState(false);
  const trips = useQuery(api.tripsQueries.getAllTrips);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Database Verification</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">How to Verify Data Storage:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Visit <a href="https://dashboard.convex.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Convex Dashboard</a></li>
          <li>Sign in to your Convex account</li>
          <li>Navigate to project: <code className="bg-gray-100 px-1 rounded">travelease-1aebc</code></li>
          <li>Click on the "Data" tab</li>
          <li>Look for the "trips" table</li>
        </ol>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setShowData(!showData)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showData ? 'Hide' : 'Show'} Stored Trip Data
        </button>
        
        <div className="text-sm text-gray-600">
          Total trips stored: <span className="font-semibold">{trips?.length || 0}</span>
        </div>
      </div>
      
      {showData && (
        <div className="border rounded-lg p-4 max-h-96 overflow-auto">
          <h3 className="font-semibold mb-2">Stored Trip Data:</h3>
          {trips ? (
            trips.length > 0 ? (
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(trips, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No trips found in database yet.</p>
            )
          ) : (
            <p className="text-gray-500 italic">Loading data...</p>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">✅ Data Storage Confirmation</h3>
        <p>All user trip information is being stored in the Convex database with full persistence.</p>
        <p className="mt-2">Fields being stored include:</p>
        <ul className="list-disc list-inside mt-1 text-sm">
          <li>Trip details (location, travelers, days, budget)</li>
          <li>Generated AI itinerary data</li>
          <li>User email and ID</li>
          <li>Comprehensive user information (timestamp, device info)</li>
          <li>Creation date</li>
        </ul>
      </div>
    </div>
  );
};

export default DataVerification;