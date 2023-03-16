import React from "react";
import "./App.css";
import Table from "./components/Table";
import { reducer } from "./reducer";
import { findTranscription } from "./scripts";

function App() {
  const [gameData, dispatch] = React.useReducer(reducer, {
    username: "",
    users: {},
    thefts: [],
  });

  React.useEffect(() => {
    findTranscription(dispatch);
  }, []);

  return (
    <div>
      <Table gameData={gameData} dispatch={dispatch} />
    </div>
  );
}

export default App;
