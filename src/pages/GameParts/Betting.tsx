import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Room } from "../../../types";
import OddButton from "../../components/button";
import useLocalState from "../../hooks/useLocalState";
import Board from "../../components/board";
import { useEffect } from "react";

export default function Betting() {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, {
    roomName: localState.roomName,
  }) as Room;
  const setDone = useMutation(api.room.setDone);
  const imDone = room.done.includes(localState.username);
  const stragglers = room.players.filter(
    (player) => !room.done.includes(player) && player !== localState.username
  );
  const tryStateChange = useMutation(api.room.tryStateChange);

  // When anyone sees everyone answer, they'll try to make game progress (hehe)
  useEffect(() => {
    if (room.done.length >= room.players.length) {
      tryStateChange({
        roomName: localState.roomName,
        fromState: "betting",
        toState: "results",
      });
    }
  }, [room, localState, tryStateChange]);

  return (
    <div className="flex items-center justify-center flex-col">
      <Board editable={!imDone} showAnswer={false} />
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
            Finalize Bets
          </OddButton>
        )}
      </div>
    </div>
  );
}
