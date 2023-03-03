import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { reducer } from "../../../reducer";
import keywords from "../../../utils/keywords";
import { setUsername } from "./setUsername.action";

it("Sets username correctly", () => {
  const { result } = renderHook(() =>
    React.useReducer(reducer, {
      username: "",
      users: {},
      thefts: [],
    })
  );

  expect(result.current[0].username).toEqual("");

  act(() => setUsername(keywords.userName, result.current[1]));

  expect(result.current[0].username).toEqual(keywords.userName);
});
