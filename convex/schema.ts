import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  Room: defineTable({
    name: v.string(),
    players: v.array(v.string()),
    state: v.string(),
    question: v.object({
      text: v.string(),
      answer: v.number(),
    }),
    seen_questions: v.array(v.id("Question")),
    answers: v.array(
      v.object({
        author: v.string(),
        value: v.float64(),
      })
    ),
    bets: v.array(
      v.object({
        better: v.string(),
        bettingOn: v.string(),
        amount: v.float64(),
      })
    ),
    done: v.array(v.string()),
    scoreboard: v.array(
      v.object({
        player: v.string(),
        score: v.float64(),
      })
    ),
  }),
  Question: defineTable({
    text: v.string(),
    answer: v.number(),
  }),
});
