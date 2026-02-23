import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("typing", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const records = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return records.filter(
      (r) => now - r.updatedAt < 2000
    );
  },
});