import React from "react";
import "./App.css";
import Table from "./components/Table";
import { reducer } from "./reducer";
import { findTranscription } from "./scripts";

function App() {
  const [gameData, dispatch] = React.useReducer(reducer, {
    users: {},
    thefts: [],
  });

  React.useEffect(() => {
    findTranscription(dispatch);
  }, []);

  React.useEffect(() => {
    console.log("gameData", gameData);
  }, []);

  return (
    <div>
      <Table gameData={gameData} dispatch={dispatch} />
    </div>
  );
}

export default App;
