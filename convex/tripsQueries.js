import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTripsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("trips")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
  },
});

export const getAllTrips = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("trips")
      .order("desc")
      .collect();
  },
});

export const getTripById = query({
  args: {
    id: v.id("trips"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTripByShareId = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("trips")
      .filter(q => q.eq(q.field("shareId"), args.shareId))
      .first();
  },
});