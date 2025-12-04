import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export const useFetchTrips = () => {
  const [userId, setUserId] = useState(null);
  
  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user._id || null);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  
  // Always call useQuery with a valid function, but use a dummy query when no user
  const queryResult = useQuery(
    api.tripsQueries.getTripsByUserId,
    userId ? { userId } : undefined
  );
  
  // Filter results to only show user's trips when userId is available
  const allTrips = userId && queryResult ? queryResult : [];
  
  return { allTrips };
};