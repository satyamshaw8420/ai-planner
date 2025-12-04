import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple test query to verify function registration
export const testQuery = query({
  args: {},
  handler: async (ctx) => {
    return "Hello from Convex!";
  },
});

// Simple test mutation
export const testMutation = mutation({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Test mutation called with:", args.message);
    return "Message received: " + args.message;
  },
});