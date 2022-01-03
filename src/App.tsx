import React from "react";
import "./App.css";
import Table from "./components/Table";
import { reducer } from "./reducer";
import { findTranscription } from "./scripts";

function App() {
  const [usersData, dispatch] = React.useReducer(reducer, {});

  React.useEffect(() => {
    findTranscription(dispatch);
  }, []);

  React.useEffect(() => {
    console.log("usersData", usersData);
  }, [usersData]);

  return (
    <div>
      <Table usersData={usersData} />
    </div>
  );
}

export default App;
