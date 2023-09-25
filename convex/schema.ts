import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  Room: defineTable({
    name: v.string(),
    players: v.array(v.string()),
    leader: v.string(),
    question: v.string(),
    answers: v.array(
      v.object({
        author: v.string(),
        value: v.float64(),
      })
    ),
  }),
});
