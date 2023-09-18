import "./App.css";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const ants = useQuery(api.ants.get);
  return (
    <div className="App">
      <div
        style={{
          width: 400,
          height: 400,
          backgroundColor: "white",
          position: "relative",
        }}
      >
        {ants?.map(({ _id, x, y }) => (
          <div
            key={_id}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              color: "black",
            }}
          >
            A
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
