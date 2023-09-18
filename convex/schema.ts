import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Other tables here...
  Ants: defineTable({ x: v.float64(), y: v.float64(), type: v.string() }),
  HomePheromone: defineTable({
    x: v.float64(),
    y: v.float64(),
    strength: v.float64(),
  }),
  PreyPheromone: defineTable({
    x: v.float64(),
    y: v.float64(),
    ttl: v.float64(),
  }),
  Prey: defineTable({ x: v.float64(), y: v.float64(), ttl: v.float64() }),
});
