import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    image: v.string(),
    online: v.boolean(),
    lastSeen: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) =>
        q.eq(q.field("clerkId"), args.clerkId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", args);
  },
});
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const setOnline = mutation({
  args: {
    userId: v.id("users"),
    online: v.boolean(), // ✅ MUST EXIST
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      online: args.online,
      lastSeen: args.online ? undefined : Date.now(),
    });
  },
});

export const setOffline = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      online: false,
      lastSeen: Date.now(),
    });
  },
});