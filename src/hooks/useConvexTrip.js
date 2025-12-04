import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useSaveTrip = () => {
  const saveTrip = useMutation(api.trips.saveTrip);
  
  const saveTripToConvex = async (tripData, formData, userEmail, userId) => {
    try {
      // Capture comprehensive user information
      const userInformation = {
        userId: userId || 'anonymous',
        userEmail: userEmail || 'unknown',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        // Add any additional user information here
      };
      
      // Log the data being sent to Convex
      const tripPayload = {
        userSelection: {
          location: {
            label: formData.location?.label || ''
          },
          travelers: formData.travelers,
          days: formData.days,
          budget: formData.budget
        },
        tripData: tripData,
        userEmail: userEmail,
        userId: userId,
        userInformation: userInformation, // Store comprehensive user info
        createdAt: Date.now(),
      };
      
      console.log("Sending trip data to Convex:", JSON.stringify(tripPayload, null, 2));
      
      const tripId = await saveTrip(tripPayload);
      
      console.log("✅ Trip successfully saved to Convex with ID:", tripId);
      console.log("📊 You can verify this data in the Convex dashboard at: https://dashboard.convex.dev");
      
      // Also log a reminder to check the dashboard
      console.log("📋 To verify data storage:");
      console.log("   1. Visit https://dashboard.convex.dev");
      console.log("   2. Sign in to your Convex account");
      console.log(`   3. Navigate to project: travelease-1aebc`);
      console.log("   4. Click on the 'Data' tab");
      console.log("   5. Look for the 'trips' table");
      
      return tripId;
    } catch (error) {
      console.error("❌ Error saving trip to Convex:", error);
      throw error;
    }
  };
  
  return { saveTripToConvex };
};