import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* START TYPING */
export const startTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: args.userId,
      });
    }
  },
});

/* STOP TYPING */
export const stopTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/* GET TYPING USERS */
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});