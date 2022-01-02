import React from "react";
import "./App.css";
import { reducer } from "./reducer";
import { findTranscription } from "./scripts";

function App() {
  const [foundTranscription, setFoundTranscription] = React.useState(false);

  const [usersData, dispatch] = React.useReducer(reducer, {});

  React.useEffect(() => {
    findTranscription(setFoundTranscription, dispatch);
  }, []);

  React.useEffect(() => {
    console.log("usersData", usersData);
  }, [usersData]);

  return (
    <div className="App">{foundTranscription && <div>Hello World</div>}</div>
  );
}

export default App;
