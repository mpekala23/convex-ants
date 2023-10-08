import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import useLocalState from "../hooks/useLocalState";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import OddInput from "../components/input";
import OddButton from "../components/button";

function getUsernameFeedbackString(username: string): string | null {
  if (username.length < 2 || username.length > 20) {
    return "Username must be between 2 and 20 characters.";
  }
  if (!username.match(/^[a-zA-Z ]+$/)) {
    return "Username must only contain letters and spaces.";
  }
  return null;
}

export default function JoinPage() {
  const joinRoom = useMutation(api.room.joinRoom);
  const { localState, setUsername } = useLocalState();
  const navigate = useNavigate();
  const [scratchUsername, setScratchUsername] = useState("");

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

  return (
    <div className="page">
      <p className="text-xl mb-2">Joining {localState.roomName}!</p>
      <p>Username:</p>
      <OddInput
        className="w-full"
        value={scratchUsername}
        setValue={setScratchUsername}
      />
      <OddButton
        className="mt-4"
        onClick={async () => {
          const feedback = getUsernameFeedbackString(scratchUsername);
          if (feedback) {
            toast.error(feedback);
            return;
          }
          setUsername(scratchUsername);
          const res = await joinRoom({
            username: scratchUsername,
            roomName: localState.roomName,
          });
          if (!res) {
            toast.error("ERROR! CONVEX...");
            return;
          }
          if (res.status === "error") {
            toast.error(res.message || "Unknown error!");
            return;
          }
          navigate("/lobby");
        }}
      >
        Join!
      </OddButton>
    </div>
  );
}
