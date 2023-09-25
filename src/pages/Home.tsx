import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import { Room } from "../../types";

export default function HomePage() {
  const rooms = useQuery(api.room.getRooms, {});
  const createRoom = useMutation(api.room.createRoom);

  const renderRoom = (room: Room) => {
    return (
      <div
        key={room.name}
        className="border border-slate-100 m-2 p-1 clickable"
      >
        {room.name}
      </div>
    );
  };

  return (
    <div className="w-64">
      <p className="text-xl pb-4">Rooms</p>
      <div className="h-64 overflow-y-auto">
        {rooms?.length == 0 && "No rooms :("}
        {rooms?.map(renderRoom)}
      </div>
      <p className="mt-4">Need more space?</p>
      <p
        className="border border-slate-100 text-center mt-2 clickable"
        onClick={async () => {
          const status = await createRoom();
          if (status === "error") {
            toast("Max room capacity reached! Sorry!");
          }
        }}
      >
        Create Room
      </p>
    </div>
  );
}
