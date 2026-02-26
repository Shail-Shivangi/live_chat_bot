import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* START OR UPDATE TYPING */
export const startTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId)
         .eq("conversationId", args.conversationId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: args.userId,
        updatedAt: Date.now(),
      });
    }
  },
});
export const stopTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_user_conversation", (q) =>
        q
          .eq("userId", args.userId)
          .eq("conversationId", args.conversationId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});


/* GET ACTIVE TYPING USERS */
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const records = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Only show users typing in the last 5 seconds
    return records.filter((r) => now - r.updatedAt < 5000);
  },
});