import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    slug: v.string(),
    data: v.object({
      elements: v.array(v.any()), // Canvas elements - using v.any() for flexibility
      artboardDimensions: v.object({
        width: v.number(),
        height: v.number(),
      }),
    }),
    userId: v.string(), // Clerk user ID
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["userId", "slug"])
    .index("by_user_updated", ["userId", "updatedAt"]),
});
