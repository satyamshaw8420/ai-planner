import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useFetchTrips = () => {
  const allTrips = useQuery(api.tripsQueries.getAllTrips);
  
  return { allTrips };
};