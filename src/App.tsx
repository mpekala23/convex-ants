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
import ViewPage from "./pages/View";

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
  {
    path: "/view",
    element: <ViewPage />,
  },
]);

function App() {
  const [localState, setLocalState] = useState<LocalState>(loadLocalState());

  return (
    <LocalContext.Provider value={[localState, setLocalState]}>
      <div className="w-screen min-h-screen md:h-screen bg-slate-900 flex items-center justify-center pb-16 md:pb-0 md:px-32 text-slate-50 font-courier">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </LocalContext.Provider>
  );
}

export default App;
