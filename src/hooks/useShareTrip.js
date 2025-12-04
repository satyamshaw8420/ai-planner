import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useShareTrip = () => {
  const updateTripShareId = useMutation(api.trips.updateTripShareId);
  
  const generateShareLink = async (tripId) => {
    try {
      // Generate a share ID for the trip
      const shareId = await updateTripShareId({ tripId });
      
      // Create the shareable link
      const shareLink = `${window.location.origin}/shared-trip/${shareId}`;
      
      return shareLink;
    } catch (error) {
      console.error("Error generating share link:", error);
      throw error;
    }
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      return false;
    }
  };
  
  return { generateShareLink, copyToClipboard };
};