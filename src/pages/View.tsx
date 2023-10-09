import { useQuery } from "convex/react";
import Meta from "../components/meta";
import useLocalState from "../hooks/useLocalState";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import Answering from "./GameParts/Answering";
import Betting from "./GameParts/Betting";
import Results from "./GameParts/Results";

export default function ViewPage() {
  const { localState } = useLocalState();
  const room = useQuery(api.room.getRoom, { roomName: localState.roomName });
  const navigate = useNavigate();

  if (!room) {
    return (
      <p className="clickable" onClick={() => navigate("/")}>
        Uh-oh! Something's wrong. Click me to go home.
      </p>
    );
  }

  return (
    <div className="wide-page">
      <Meta />
      {room.state === "answering" && <Answering viewing />}
      {room.state === "betting" && <Betting viewing />}
      {room.state === "results" && <Results viewing />}
    </div>
  );
}
