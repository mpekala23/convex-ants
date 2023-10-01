import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import { Room } from "../../types";
import useLocalState from "../hooks/useLocalState";
import { useNavigate } from "react-router-dom";
import OddButton from "../components/button";

export default function HomePage() {
  const rooms = useQuery(api.room.getRooms, {});
  const createRoom = useMutation(api.room.createRoom);
  const { setRoomName } = useLocalState();
  const navigate = useNavigate();

  const renderRoom = (room: Room) => {
    return (
      <OddButton
        key={room.name}
        className="m-2 p-1"
        onClick={() => {
          setRoomName(room.name);
          navigate("/join-room");
        }}
      >
        {room.name}
      </OddButton>
    );
  };

  return (
    <div className="page">
      <p className="text-xl pb-4">Rooms</p>
      <div className="h-64 overflow-y-auto">
        {rooms?.length == 0 && "No rooms :("}
        {rooms?.map(renderRoom)}
      </div>
      <p className="mt-4">Need more space?</p>
      <OddButton
        className="mt-2"
        onClick={async () => {
          const status = await createRoom();
          if (status === "error") {
            toast("Max room capacity reached! Sorry!");
          }
        }}
      >
        Create Room
      </OddButton>
    </div>
  );
}
