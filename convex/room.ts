import { query, mutation } from "./_generated/server";
import { Failable, Room } from "../types";
import { MIN_PLAYER_COUNT } from "../consts";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const ADJECTIVES = ["sneaky", "tasty", "heavy", "funny"];
const NOUNS = ["hippo", "bear", "ant", "shark"];

// Inefficient but who cares
function shuffle_names() {
  ADJECTIVES.sort(() => (Math.random() < 0.5 ? -1 : 1));
  NOUNS.sort(() => (Math.random() < 0.5 ? -1 : 1));
}

// Helper function to give the frontend more comprehensible types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanRoom(room: any): Room {
  return {
    name: room.name,
    players: room.players,
    state: room.state,
    question: room.question,
    answers: room.answers,
    bets: room.bets,
    done: room.done,
    scoreboard: room.scoreboard,
  };
}

// Helper function to generate a kind-of-informative result
function failable(status: "ok" | "error", message?: string): Failable {
  return { status, message };
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
      state: "lobby",
      question: {
        text: "",
        answer: 0,
      },
      seen_questions: [],
      answers: [],
      bets: [],
      done: [],
      scoreboard: [],
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

export const getRoom = query({
  args: { roomName: v.string() },
  handler: async (ctx, { roomName }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) return null;
    return cleanRoom(room);
  },
});

export const joinRoom = mutation({
  args: {
    username: v.string(),
    roomName: v.string(),
  },
  handler: async (ctx, { username, roomName }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (room.players.includes(username)) {
      return failable("error", "Username already taken");
    }
    const newPlayers = [...room.players, username];
    await ctx.db.patch(room._id, { players: newPlayers });
    return failable("ok");
  },
});

export const getNewQuestion = query({
  args: {
    roomName: v.string(),
  },
  handler: async (ctx, { roomName }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    const new_ids = (await ctx.db.query("Question").collect())
      .map((q) => q._id)
      .filter((q) => !room.seen_questions.includes(q));
    if (new_ids.length <= 0) {
      return failable("error", "No more questions");
    }
    // Pick a random question
    const question = await ctx.db.get(
      new_ids[Math.floor(Math.random() * new_ids.length)]
    );
    if (question == null) {
      return failable("error", "Question does not exist");
    }
    return question;
  },
});

export const startGame = mutation({
  args: {
    roomName: v.string(),
  },
  handler: async (ctx, { roomName }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (room.players.length < MIN_PLAYER_COUNT) {
      return failable("error", "Not enough players");
    }
    const scoreboard = room.players.map((player) => ({
      player,
      score: 0,
    }));
    // TODO: Dynamic questions
    const question = (await getNewQuestion(ctx, { roomName })) as {
      _id: Id<"Question">;
      text: string;
      answer: number;
    };
    await ctx.db.patch(room._id, {
      state: "answering",
      question: {
        text: question.text,
        answer: question.answer,
      },
      seen_questions: [question._id],
      answers: [],
      bets: [],
      scoreboard,
    });
    return failable("ok");
  },
});

export const tryStateChange = mutation({
  args: {
    roomName: v.string(),
    fromState: v.string(),
    toState: v.string(),
  },
  handler: async (ctx, { roomName, fromState, toState }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (room.state !== fromState) {
      if (room.state === toState) return failable("ok");
      return failable("error", "Room state changed");
    }
    await ctx.db.patch(room._id, { state: toState });
    // Handle special cases
    if (fromState === "betting" && toState === "results") {
      // Reset done so we can use it again
      await ctx.db.patch(room._id, { done: [] });
      // Figure out the winning guess(es)
      let correctValue: number | null = null;
      const guessNums = room.answers.map((a) => a.value);
      guessNums.sort((a, b) => a - b);
      let checkIx = 0;
      while (
        checkIx < guessNums.length &&
        guessNums[checkIx] <= room.question.answer
      ) {
        correctValue = guessNums[checkIx];
        checkIx++;
      }
      const rightAuthors = room.answers
        .filter((a) => a.value === correctValue)
        .map((a) => a.author);
      // Figure out how we need to change scores
      const diffMap: { [key: string]: number } = {};
      rightAuthors.forEach((author) => {
        diffMap[author] = 1; // Correct answer gives a bonus point
      });
      room.bets.forEach((bet) => {
        if (diffMap[bet.better] === undefined) diffMap[bet.better] = 0;
        if (rightAuthors.includes(bet.bettingOn)) {
          diffMap[bet.better] += bet.amount + 1;
          // If this is the only betters bet, it's worth double
          const otherBets = room.bets.filter(
            (b) => b.better == bet.better && b.bettingOn !== bet.bettingOn
          );
          if (otherBets.length <= 0) {
            diffMap[bet.better] += 1;
          }
        } else {
          diffMap[bet.better] -= bet.amount;
        }
      });
      // Update the scoreboard
      const newScoreboard = room.scoreboard.map((score) => ({
        ...score,
        score: score.score + (diffMap[score.player] || 0),
      }));
      await ctx.db.patch(room._id, { scoreboard: newScoreboard });
    }
    if (fromState === "results" && toState === "answering") {
      // Reset answers and bets and done
      const question = (await getNewQuestion(ctx, { roomName })) as {
        _id: Id<"Question">;
        text: string;
        answer: number;
      };
      await ctx.db.patch(room._id, {
        question: {
          text: question.text,
          answer: question.answer,
        },
        seen_questions: [...room.seen_questions, question._id],
        answers: [],
        bets: [],
        done: [],
      });
    }
    return failable("ok");
  },
});

// Submits an answer for a user. Can only be done ONCE.
export const submitAnswer = mutation({
  args: {
    roomName: v.string(),
    username: v.string(),
    answer: v.float64(),
  },
  handler: async (ctx, { roomName, username, answer }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(username)) {
      return failable("error", "Username not in room");
    }
    if (room.answers.some((a) => a.author == username)) {
      return failable("error", "Already submitted answer");
    }
    const newAnswers = [...room.answers, { author: username, value: answer }];
    await ctx.db.patch(room._id, { answers: newAnswers });
    return failable("ok");
  },
});

/// Submits a bet for a user.
/// RULES:
/// - Everyone gets to make at most two bets per round
/// - You can add on a "value" to a bet, which is subtracted from your score and you are essentially wagering
/// - If you only make one bet, then instead of +1 you'll get plus two
export const submitBet = mutation({
  args: {
    roomName: v.string(),
    better: v.string(),
    bettingOn: v.string(),
    amount: v.float64(),
  },
  handler: async (ctx, { roomName, better, bettingOn, amount }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(better)) {
      return failable("error", "Username not in room");
    }
    const myBets = room.bets.filter((b) => b.better == better);
    if (myBets.length >= 2) {
      return failable(
        "error",
        "You can only submit two distinct bets. Delete one of your others first."
      );
    }
    const exisingTotal = myBets.reduce((acc, bet) => acc + bet.amount, 0);
    const myScore = room.scoreboard.find((s) => s.player == better)?.score;
    if (myScore === undefined) {
      return failable("error", "You don't seem to have a score...?");
    }
    if (exisingTotal + amount > myScore) {
      return failable("error", "You can't bet more than your current score.");
    }
    const newBets = [...room.bets, { better, bettingOn, amount }];
    await ctx.db.patch(room._id, { bets: newBets });
    return failable("ok");
  },
});

/// Removes a bet for a user
export const removeBet = mutation({
  args: {
    roomName: v.string(),
    better: v.string(),
    bettingOn: v.string(),
  },
  handler: async (ctx, { roomName, better, bettingOn }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(better)) {
      return failable("error", "Username not in room");
    }
    const myBets = room.bets.filter((b) => b.better == better);
    const bet = myBets.find((b) => b.bettingOn == bettingOn);
    if (bet === undefined) {
      return failable("error", "You don't have a bet on that answer.");
    }
    const newBets = room.bets.filter((b) => b !== bet);
    await ctx.db.patch(room._id, { bets: newBets });
    return failable("ok");
  },
});

/// Increases the amount of a bet for a user by one
export const increaseBet = mutation({
  args: {
    roomName: v.string(),
    better: v.string(),
    bettingOn: v.string(),
  },
  handler: async (ctx, { roomName, better, bettingOn }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(better)) {
      return failable("error", "Username not in room");
    }
    const myBets = room.bets.filter((b) => b.better == better);
    const bet = myBets.find((b) => b.bettingOn == bettingOn);
    if (bet === undefined) {
      return failable("error", "You don't have a bet on that answer.");
    }
    const exisingTotal = myBets.reduce((acc, bet) => acc + bet.amount, 0);
    const myScore = room.scoreboard.find((s) => s.player == better)?.score;
    if (myScore === undefined) {
      return failable("error", "You don't seem to have a score...?");
    }
    if (exisingTotal + 1 > myScore) {
      return failable("error", "You can't bet more than your current score.");
    }
    const newBets = room.bets.map((b) =>
      b === bet ? { ...b, amount: b.amount + 1 } : b
    );
    await ctx.db.patch(room._id, { bets: newBets });
    return failable("ok");
  },
});

/// Decreases the amount of a bet for a user by one
export const decreaseBet = mutation({
  args: {
    roomName: v.string(),
    better: v.string(),
    bettingOn: v.string(),
  },
  handler: async (ctx, { roomName, better, bettingOn }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(better)) {
      return failable("error", "Username not in room");
    }
    const myBets = room.bets.filter((b) => b.better == better);
    const bet = myBets.find((b) => b.bettingOn == bettingOn);
    if (bet === undefined) {
      return failable("error", "You don't have a bet on that answer.");
    }
    const newBets = room.bets.map((b) =>
      b === bet ? { ...b, amount: Math.max(b.amount - 1, 0) } : b
    );
    await ctx.db.patch(room._id, { bets: newBets });
    return failable("ok");
  },
});

export const setDone = mutation({
  args: {
    roomName: v.string(),
    username: v.string(),
  },
  handler: async (ctx, { roomName, username }) => {
    const room = await ctx.db
      .query("Room")
      .filter((q) => q.eq(q.field("name"), roomName))
      .first();
    if (room == null) {
      return failable("error", "Room does not exist");
    }
    if (!room.players.includes(username)) {
      return failable("error", "Username not in room");
    }
    if (room.done.includes(username)) {
      return failable("ok");
    }
    const newDone = [...room.done, username];
    await ctx.db.patch(room._id, { done: newDone });
    return failable("ok");
  },
});
