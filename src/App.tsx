import "./App.css";
import HomePage from "./pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { loadLocalState, LocalContext } from "./hooks/useLocalState";
import { useState } from "react";
import { LocalState } from "../types";
import JoinPage from "./pages/Join";
import LobbyPage from "./pages/Lobby";
import GamePage from "./pages/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/join-room",
    element: <JoinPage />,
  },
  {
    path: "/lobby",
    element: <LobbyPage />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
]);

function App() {
  const [localState, setLocalState] = useState<LocalState>(loadLocalState());

  return (
    <LocalContext.Provider value={[localState, setLocalState]}>
      <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-32 text-slate-50 font-courier">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </LocalContext.Provider>
  );
}

export default App;
