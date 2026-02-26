import { mutation, query } from "./_generated/server";
import { v } from "convex/values";



export const createOrGetConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    const existing = conversations.find(
      (c) =>
        !c.isGroup &&
        c.members.length === 2 &&
        c.members.includes(args.user1) &&
        c.members.includes(args.user2)
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      members: [args.user1, args.user2],
      isGroup: false,
      updatedAt: Date.now(),
    });
  },
});
export const getConversations = query({
  handler: async (ctx) => {
    return await ctx.db.query("conversations").collect();
  },
});


export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations.filter((c) =>
      c.members.includes(args.userId)
    );

    const results = await Promise.all(
      userConversations.map(async (convo) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", convo._id)
          )
          .collect();

        const unreadCount = messages.filter((m) => {
          const readBy = m.readBy ?? [];
          return m.senderId !== args.userId && !readBy.includes(args.userId);
        }).length;

        return {
          ...convo,
          unreadCount,
        };
      })
    );

    return results;
  },
});