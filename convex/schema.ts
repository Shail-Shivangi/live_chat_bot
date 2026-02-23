import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
  clerkId: v.string(),
  name: v.string(),
  image: v.string(),
  online: v.boolean(),
  lastSeen: v.optional(v.number()),
}).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    members: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
  }),

  messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  body: v.string(),
  deleted: v.boolean(),
  createdAt: v.number(),
}).index("by_conversation", ["conversationId"]),

 typing: defineTable({
  conversationId: v.id("conversations"),
  userId: v.id("users"),
  updatedAt: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_user", ["userId"]),
});