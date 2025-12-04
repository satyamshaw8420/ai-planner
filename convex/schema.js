import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trips: defineTable({
    userSelection: v.object({
      location: v.object({
        label: v.string()
      }),
      travelers: v.union(v.number(), v.null()),
      days: v.string(),
      budget: v.union(v.number(), v.null())
    }),
    tripData: v.any(),
    userEmail: v.optional(v.string()),
    userId: v.optional(v.string()),
    userInformation: v.optional(v.object({
      userId: v.string(),
      userEmail: v.string(),
      timestamp: v.number(),
      userAgent: v.string(),
      fullname: v.optional(v.string())
    })),
    createdAt: v.number(),
    shareId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});