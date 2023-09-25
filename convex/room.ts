import { query, mutation } from "./_generated/server";
import { Room } from "../types";

const ADJECTIVES = ["sneaky", "tasty", "heavy", "funny"];
const NOUNS = ["hippo", "bear", "ant", "shark"];

function shuffle_names() {
  ADJECTIVES.sort(() => (Math.random() < 0.5 ? -1 : 1));
  NOUNS.sort(() => (Math.random() < 0.5 ? -1 : 1));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanRoom(room: any): Room {
  return {
    name: room.name,
    players: room.players,
    leader: room.leader,
    question: room.question,
    answers: room.answers,
  };
}

export const createRoom = mutation({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("Room").collect();
    if (rooms.length >= ADJECTIVES.length * NOUNS.length) {
      return "error";
    }
    shuffle_names();
    let name = "";
    ADJECTIVES.forEach((adj) => {
      NOUNS.forEach((noun) => {
        const tryName = `${adj}-${noun}`;
        if (rooms.some((room) => room.name == tryName)) return;
        name = tryName;
      });
    });
    await ctx.db.insert("Room", {
      name,
      players: [],
      leader: "",
      question: "",
      answers: [],
    });
    return "ok";
  },
});

export const getRooms = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("Room").collect()).map(cleanRoom);
  },
});
