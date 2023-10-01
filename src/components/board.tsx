import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../../convex/_generated/api";
import { Room } from "../../types";
import OddButton from "./button";
import useLocalState from "../hooks/useLocalState";
import { BetGroup } from "../../types";

interface Props {
  editable: boolean;
  showAnswer: boolean;
}

export default function Board({ editable, showAnswer }: Props) {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, {
    roomName: localState.roomName,
  }) as Room;
  const [betGroups, setBetGroups] = useState<BetGroup[]>([]);
  const canonicalPlayers = room.players.sort();
  const submitBet = useMutation(api.room.submitBet);
  const removeBet = useMutation(api.room.removeBet);
  const increaseBet = useMutation(api.room.increaseBet);
  const decreaseBet = useMutation(api.room.decreaseBet);

  useEffect(() => {
    if (!room) return;
    const newBetGroups: BetGroup[] = [];
    // First go through and group the bets together
    room.answers.forEach((answer) => {
      if (newBetGroups.some((group) => group.value === answer.value)) {
        const ref = newBetGroups.find((group) => group.value === answer.value);
        if (!ref || ref.authors.includes(answer.author)) return;
        ref.authors.push(answer.author);
        ref.authors.sort();
      } else {
        newBetGroups.push({
          authors: [answer.author],
          value: answer.value,
          betters: {},
          isCorrect: false,
        });
      }
    });
    newBetGroups.sort((a, b) => a.value - b.value);
    let min_ix_less = -1;
    while (
      min_ix_less < newBetGroups.length - 1 &&
      newBetGroups[min_ix_less + 1].value <= room.question.answer
    ) {
      min_ix_less++;
    }
    if (min_ix_less >= 0) {
      newBetGroups[min_ix_less].isCorrect = true;
    }
    // Then go through and add the bets
    newBetGroups.forEach((group) => {
      room.bets.forEach((bet) => {
        if (group.authors.includes(bet.bettingOn)) {
          group.betters[bet.better] = bet.amount;
        }
      });
    });
    // Finally update!
    setBetGroups(newBetGroups);
  }, [room, setBetGroups]);

  const toggleBet = async (betGroup: BetGroup) => {
    if (!editable) return;
    if (
      betGroup.betters[localState.username] !== null &&
      betGroup.betters[localState.username] !== undefined
    ) {
      const res = await removeBet({
        roomName: localState.roomName,
        better: localState.username,
        bettingOn: betGroup.authors[0],
      });
      if (!res) {
        toast.error("Something went wrong!");
        return;
      }
      if (res.status === "error") {
        toast.error(res.message || "AHHHH");
        return;
      }
    } else {
      const res = await submitBet({
        roomName: localState.roomName,
        better: localState.username,
        bettingOn: betGroup.authors[0],
        amount: 0,
      });
      if (!res) {
        toast.error("Something went wrong!");
        return;
      }
      if (res.status === "error") {
        toast.error(res.message || "AHHHH");
        return;
      }
    }
  };

  const tweakBet = async (betGroup: BetGroup, type: "up" | "down") => {
    if (!editable) return;
    const res =
      type == "up"
        ? await increaseBet({
            roomName: localState.roomName,
            better: localState.username,
            bettingOn: betGroup.authors[0],
          })
        : await decreaseBet({
            roomName: localState.roomName,
            better: localState.username,
            bettingOn: betGroup.authors[0],
          });
    if (!res) {
      toast.error("Something went wrong!");
      return;
    }
    if (res.status === "error") {
      toast.error(res.message || "AHHHH");
      return;
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <p className="text-center font-bold text-3xl mb-8">
        {room.question.text}
      </p>
      <div className="flex w-full items-center justify-center">
        {betGroups.map((group) => {
          const myBet = group.betters[localState.username];
          const iHaveBet = myBet !== null && myBet !== undefined;
          const bgColor =
            group.isCorrect && showAnswer ? "bg-green-400" : "bg-slate-100";

          return (
            <div className="flex flex-col mx-8 items-center w-64">
              <div
                className={`flex flex-col justify-center items-center py-8 mb-8  w-full h-64  text-slate-950 ${
                  editable ? "clickable" : ""
                } ${bgColor}`}
                onClick={() => {
                  toggleBet(group);
                }}
              >
                <div className="flex flex-1 flex-col items-center justify-center">
                  <p className="text-center text-4xl">
                    {group.value}
                    {showAnswer && group.isCorrect && <span> 🎉</span>}
                  </p>
                  {showAnswer && group.isCorrect && (
                    <p className="text-center text-sm italic opacity-75">
                      Actual Answer: {room.question.answer}
                    </p>
                  )}
                </div>
                <p className="text-center">
                  Author(s): {group.authors.join(", ")}
                </p>
              </div>
              <div className="w-full">
                <div className="flex items-center mb-8">
                  <div
                    className={`w-16 h-16 mr-4 border-slate-100 border-8 border-dashed rounded-full ${
                      iHaveBet ? bgColor : ""
                    }`}
                  />
                  <p className="text-2xl">
                    {iHaveBet && (
                      <div className="flex">
                        <OddButton
                          className="w-12 h-12 flex justify-center items-center"
                          disabled={myBet <= 0 || !editable}
                          onClick={() => {
                            tweakBet(group, "down");
                          }}
                        >
                          -
                        </OddButton>
                        <div className="mx-2">
                          <p className="text-center">{myBet}</p>
                          <p className="text-sm italic opacity-75 text-center">
                            Ante
                          </p>
                        </div>
                        <OddButton
                          className="w-12 h-12 flex justify-center items-center"
                          onClick={() => {
                            tweakBet(group, "up");
                          }}
                          disabled={!editable}
                        >
                          +
                        </OddButton>
                      </div>
                    )}
                    {!iHaveBet && "No bet"}
                  </p>
                </div>
                <div className="w-full">
                  {canonicalPlayers.map((player) => {
                    if (player == localState.username) return null;
                    const theirBet = group.betters[player];
                    const theyHaveBet =
                      group.betters[player] !== null &&
                      group.betters[player] !== undefined;
                    return (
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 mr-2 border-slate-100 border-4 border-dashed rounded-full ${
                            theyHaveBet ? bgColor : ""
                          }`}
                        />
                        <p>
                          {player}: {theyHaveBet ? theirBet : "No bet"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
