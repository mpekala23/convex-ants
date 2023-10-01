import { useEffect, useState } from "react";
import useLocalState from "../../hooks/useLocalState";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Room } from "../../../types";
import OddButton from "../../components/button";
import { OddGuess } from "../../components/input";

export default function Answering() {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, {
    roomName: localState.roomName,
  }) as Room;
  const [guess, setGuess] = useState<number>(0);
  const submitAnswer = useMutation(api.room.submitAnswer);
  const tryStateChange = useMutation(api.room.tryStateChange);

  const hasAlreadyAnswered = room.answers.some(
    (answer) => answer.author === localState.username
  );

  // When anyone sees everyone answer, they'll try to make game progress (hehe)
  useEffect(() => {
    if (room.answers.length >= room.players.length) {
      tryStateChange({
        roomName: localState.roomName,
        fromState: "answering",
        toState: "betting",
      });
    }
  }, [room, localState, tryStateChange]);

  const dynamicPart = () => {
    if (hasAlreadyAnswered) {
      const answer = room.answers.find(
        (answer) => answer.author === localState.username
      )?.value;
      const stragglers = room.players.filter(
        (player) =>
          !room.answers.some((answer) => answer.author === player) &&
          player !== localState.username
      );
      return (
        <>
          <p className="text-xl text-center mb-2">You've already answered:</p>
          <p className="text-xl text-center mb-2">{answer}</p>
          <p className="text-center text-sm italic opacity-50">
            Waiting for {stragglers.join(", ")}...
          </p>
        </>
      );
    } else {
      return (
        <div className="w-64">
          <p>Your guess:</p>
          <OddGuess value={guess} setValue={setGuess} className="w-full mb-4" />
          <OddButton
            onClick={() =>
              submitAnswer({
                roomName: localState.roomName,
                username: localState.username,
                answer: guess,
              })
            }
          >
            Submit Answer
          </OddButton>
        </div>
      );
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <p className="text-center font-bold text-3xl mb-8">
        {room.question.text}
      </p>
      {dynamicPart()}
    </div>
  );
}
