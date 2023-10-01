import { useMutation, useQuery } from "convex/react";
import Board from "../../components/board";
import useLocalState from "../../hooks/useLocalState";
import { api } from "../../../convex/_generated/api";
import { Room } from "../../../types";
import OddButton from "../../components/button";
import { useEffect, useState } from "react";

export default function Results() {
  const { localState } = useLocalState();
  const setDone = useMutation(api.room.setDone);
  const room = useQuery(api.room.getRoom, {
    roomName: localState.roomName,
  }) as Room;
  const imDone = room.done.includes(localState.username);
  const stragglers = room.players.filter(
    (player) => !room.done.includes(player) && player !== localState.username
  );
  const [onScoreboard, setOnscoreboard] = useState(false);
  const sortedScoreboard = room.scoreboard.sort((a, b) => b.score - a.score);
  const tryStateChange = useMutation(api.room.tryStateChange);

  // When anyone sees everyone answer, they'll try to make game progress (hehe)
  useEffect(() => {
    if (room.done.length >= room.players.length) {
      tryStateChange({
        roomName: localState.roomName,
        fromState: "results",
        toState: "answering",
      });
    }
  }, [room, localState, tryStateChange]);

  return (
    <div className="flex items-center justify-center flex-col">
      {!onScoreboard && (
        <>
          <Board editable={false} showAnswer={true} />
          <div className="mt-16">
            <OddButton
              className="p-2 text-2xl"
              onClick={() => {
                setOnscoreboard(true);
              }}
            >
              Goto Scoreboard
            </OddButton>
          </div>
        </>
      )}
      {onScoreboard && (
        <>
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">Scoreboard</div>
            <div className="flex flex-col items-center justify-center">
              {sortedScoreboard.map((player) => (
                <div className="flex flex-row items-center justify-center">
                  <div className="text-2xl font-bold">
                    {player.player}: {player.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16">
            {imDone && <div>Waiting for {stragglers.join(", ")}...</div>}
            {!imDone && (
              <OddButton
                className="p-2 text-2xl"
                onClick={() =>
                  setDone({
                    roomName: localState.roomName,
                    username: localState.username,
                  })
                }
              >
                Start Next Round
              </OddButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
