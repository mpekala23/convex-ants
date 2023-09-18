import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear messages table",
  { seconds: 1 },
  api.ants.moveAllRandomly
);

export default crons;
