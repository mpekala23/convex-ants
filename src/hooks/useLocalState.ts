import { Dispatch, createContext, useCallback, useContext } from "react";
import { LocalState } from "../../types";

export const LocalContext = createContext<[LocalState, Dispatch<LocalState>]>([
  {
    username: "",
    roomName: "",
  },
  () => null,
]);

function writeToSessionStorage(localState: LocalState) {
  sessionStorage.setItem("localState", JSON.stringify(localState));
}

function readFromSessionStorage(): LocalState {
  const localState = sessionStorage.getItem("localState");
  if (localState) {
    return JSON.parse(localState);
  }
  return {
    username: "",
    roomName: "",
  };
}

export function loadLocalState(): LocalState {
  return readFromSessionStorage();
}

export default function useLocalState(): {
  localState: LocalState;
  setLocalState: Dispatch<LocalState>;
  setUsername: Dispatch<string>;
  setRoomName: Dispatch<string>;
} {
  const [localState, setLocalState] = useContext(LocalContext);

  const persistSet = useCallback(
    (newState: LocalState) => {
      writeToSessionStorage(newState);
      setLocalState(newState);
    },
    [setLocalState]
  );

  const setUsername = useCallback(
    (username: string) => {
      const newState = { ...localState, username };
      persistSet(newState);
    },
    [localState, persistSet]
  );

  const setRoomName = useCallback(
    (roomName: string) => {
      const newState = { ...localState, roomName };
      persistSet(newState);
    },
    [localState, persistSet]
  );

  return { localState, setLocalState: persistSet, setUsername, setRoomName };
}
