import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export const useSaveTrip = () => {
  const [isLoading, setIsLoading] = useState(false);
  const saveTrip = useMutation(api.trips.saveTrip);

  const saveTripToConvex = async ({
    userSelection: formData,
    tripData,
    userEmail,
    userId,
    userInformation
  }) => {
    try {
      console.log("🚀 Initiating trip save to Convex database...");
      console.log("Received formData:", formData);
      
      // Validate required fields
      if (!formData) {
        throw new Error("Form data is required");
      }
      
      // Ensure location object exists with proper structure
      const locationData = (formData && formData.location) ? formData.location : { label: '' };
      
      // Capture comprehensive user information
      const userInfo = {
        userId: userId || 'anonymous',
        userEmail: userEmail || 'unknown',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        // Add any additional user information here
      };

      // Build userInformation object carefully to avoid validation errors
      const userInformationPayload = {
        userId: (userInformation && userInformation.userId) || userId || 'anonymous',
        userEmail: (userInformation && userInformation.userEmail) || userEmail || 'unknown',
        timestamp: (userInformation && userInformation.timestamp) || Date.now(),
        userAgent: (userInformation && userInformation.userAgent) || navigator.userAgent,
      };
      
      // Only add fullname if it exists and is not null/undefined/empty
      if (userInformation && userInformation.fullname && userInformation.fullname.trim() !== '') {
        userInformationPayload.fullname = userInformation.fullname;
      }

      // Log the data being sent to Convex
      const tripPayload = {
        userSelection: {
          location: {
            label: (locationData && locationData.label) ? locationData.label : (formData && formData.destination) ? formData.destination : ''
          },
          travelers: (formData && formData.travelers) ? formData.travelers.id : null,
          days: formData && formData.days ? formData.days : '',
          budget: (formData && formData.budget) ? formData.budget.id : null,
          // New fields in the correct location
          numberOfMembers: (formData && formData.numberOfMembers) ? parseInt(formData.numberOfMembers) : null,
          startDate: (formData && formData.startDate) ? formData.startDate : null
        },
        tripData: tripData,
        userEmail: userEmail,
        userId: userId,
        userInformation: userInformationPayload,
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