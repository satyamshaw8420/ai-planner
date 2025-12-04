import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useFetchTrip = (tripId) => {
  const trip = useQuery(api.tripsQueries.getTripById, { id: tripId });
  
  return { trip };
};