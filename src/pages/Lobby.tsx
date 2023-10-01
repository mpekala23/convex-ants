import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import useLocalState from "../hooks/useLocalState";
import { useNavigate } from "react-router-dom";
import OddButton from "../components/button";
import Meta from "../components/meta";
import { MIN_PLAYER_COUNT } from "../../consts";
import { useEffect } from "react";

export default function LobbyPage() {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, { roomName: localState.roomName });
  const startGame = useMutation(api.room.startGame);
  const navigate = useNavigate();

  // If somebody else hits "Start Game!"
  useEffect(() => {
    if (room && room.state !== "lobby") {
      navigate("/game");
    }
  }, [room, navigate]);

  if (localState.roomName.length <= 0) {
    return (
      <p
        className="clickable"
        onClick={() => {
          navigate("/");
        }}
      >
        Help! Something went wrong. Click me to go back home.
      </p>
    );
  }

  if (!room) {
    return (
      <p className="clickable" onClick={() => navigate("/")}>
        Uh-oh! Something's wrong. Click me to go home.
      </p>
    );
  }

  return (
    <div className="page">
      <Meta />
      <p className="text-xl mb-2">Lobby: {localState.roomName}</p>
      <p className="underline">Players:</p>
      <ul className="h-64 overflow-y-scroll mb-4">
        {room.players.map((player) => (
          <li key={player}>{player}</li>
        ))}
      </ul>
      <OddButton
        disabled={room.players.length < MIN_PLAYER_COUNT}
        disabledText="You need at least two players to start the game..."
        onClick={async () => {
          const res = await startGame({ roomName: localState.roomName });
          if (res == null) {
            toast.error("Something went wrong. AHHHHHHHHHHHHH!");
            return;
          }
          if (res.status === "error") {
            toast.error(res.message || "AHHHHHHHH");
            return;
          }
          navigate("/game");
        }}
      >
        Start Game!
      </OddButton>
    </div>
  );
}
