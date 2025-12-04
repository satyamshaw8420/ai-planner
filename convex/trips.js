import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveTrip = mutation({
  args: {
    userSelection: v.object({
      location: v.object({
        label: v.string()
      }),
      travelers: v.optional(v.union(v.number(), v.null())),
      days: v.string(),
      budget: v.union(v.number(), v.null()),
      // New fields
      numberOfMembers: v.optional(v.union(v.number(), v.null())),
      startDate: v.optional(v.union(v.string(), v.null())),
    }),
    tripData: v.any(),
    userEmail: v.optional(v.string()),
    userId: v.optional(v.string()),
    userInformation: v.optional(v.object({
      userId: v.string(),
      userEmail: v.string(),
      timestamp: v.number(),
      userAgent: v.string(),
      fullname: v.optional(v.string()),
      // Add the new fields here as well
      numberOfMembers: v.optional(v.union(v.number(), v.null())),
      startDate: v.optional(v.union(v.string(), v.null()))
    })),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("trips", {
      userSelection: args.userSelection,
      tripData: args.tripData,
      userEmail: args.userEmail,
      userId: args.userId,
      userInformation: args.userInformation,
      createdAt: Date.now(),
      shareId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Generate unique share ID
    });
    
    return tripId;
  },
});

export const updateTripShareId = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update the trip with the share ID
    await ctx.db.patch(args.tripId, {
      shareId: shareId
    });
    
    return shareId;
  },
});