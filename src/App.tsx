import "./App.css";
import HomePage from "./pages/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

function App() {
  return (
    <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-32">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
