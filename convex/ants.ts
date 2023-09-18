import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("Ants").collect();
  },
});

// Create a new task with the given text
export const moveGranular = mutation({
  args: { id: v.id("Ants"), x: v.float64(), y: v.float64() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { x: args.x, y: args.y });
  },
});

export const moveAllRandomly = mutation({
  args: {},
  handler: async (ctx) => {
    const ants = await get(ctx, {});
    ants.forEach((ant) => {
      console.log(ant.x);
      ctx.db.patch(ant._id, {
        x: Math.max(Math.min(ant.x + (Math.random() > 0.5 ? 1 : -1), 100), 0),
        y: Math.max(Math.min(ant.y + (Math.random() > 0.5 ? 1 : -1), 100), 0),
      });
    });
  },
});
