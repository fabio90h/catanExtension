import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../../reducer";

import { GameData } from "../../../../types";
import { initiateTestingPlayers } from ".";
import { emptyResources } from "../../../data";
import { shuffleArray } from "../../general/shuffleArray/shuffleArray.general";

describe("initiateTestingPlayers", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let player1: string;
  let player2: string;

  beforeEach(() => {
    // Reducer data setup
    const { result: hookResult } = renderHook(() =>
      React.useReducer(reducer, {
        users: {},
        thefts: [],
      })
    );
    result = hookResult;
  });

  it("initiates the players with resources", () => {
    // Creates the players and its initial resources
    act(() => initiateTestingPlayers(result.current[1]));

    // Picking a random player
    const players = Object.keys(result.current[0].users);
    [player1, player2] = shuffleArray(players);

    expect(result.current[0].users[player1].config).toHaveProperty("color");
    expect(
      Object.values(result.current[0].users[player1].resources).some(
        (value) => {
          return value >= 1;
        }
      )
    ).toBeTruthy();
    expect(result.current[0].users[player2].config).toHaveProperty("color");
    expect(
      Object.values(result.current[0].users[player2].resources).some(
        (value) => {
          return value >= 1;
        }
      )
    ).toBeTruthy();
  });

  it("initiates the players with empty resources", () => {
    // Creates the players and its initial resources
    act(() => initiateTestingPlayers(result.current[1], true));

    // Picking a random player
    const players = Object.keys(result.current[0].users);
    [player1, player2] = shuffleArray(players);

    expect(result.current[0].users[player1].config).toHaveProperty("color");
    expect(result.current[0].users[player1].resources).toStrictEqual({
      ...emptyResources,
    });
    expect(result.current[0].users[player2].config).toHaveProperty("color");
    expect(result.current[0].users[player2].resources).toStrictEqual({
      ...emptyResources,
    });
  });
});
