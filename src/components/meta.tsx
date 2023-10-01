import { useQuery } from "convex/react";
import useLocalState from "../hooks/useLocalState";
import { api } from "../../convex/_generated/api";

export default function Meta() {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, {
    roomName: localState.roomName,
  });
  const sortedScores = room?.scoreboard.sort((a, b) => b.score - a.score);
  const myScore = sortedScores?.find(
    (score) => score.player === localState.username
  );
  let myRank = sortedScores?.findIndex(
    (score) => score.player === localState.username
  );
  const tied = sortedScores?.filter(
    (score) => score.score === myScore?.score
  ).length;
  const lowestPos = sortedScores?.findIndex(
    (score) => score.score === myScore?.score
  );
  if (tied && tied > 1 && lowestPos !== undefined) {
    myRank = lowestPos;
  }
  if (myRank === undefined) {
    myRank = -1;
  }
  myRank += 1;
  let myRankSuffix = "th";
  if (myRank === 1) {
    myRankSuffix = "st";
  } else if (myRank === 2) {
    myRankSuffix = "nd";
  } else if (myRank === 3) {
    myRankSuffix = "rd";
  }

  return (
    <div className="absolute left-0 top-0 border-r border-b p-4 bg-slate-700 border-slate-100">
      <p>
        Room: <span className="font-bold">{localState.roomName}</span>
      </p>
      <p>
        Username: <span className="font-bold">{localState.username}</span>
      </p>
      {myScore && (
        <p>
          Score: <span className="font-bold">{myScore.score}</span>
        </p>
      )}
      {myRank !== undefined && (
        <p>
          Rank:{" "}
          <span className="font-bold">
            {tied && tied > 1 ? "T-" : ""}
            {myRank}
            {myRankSuffix}
          </span>
        </p>
      )}
    </div>
  );
}
