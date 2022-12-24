import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../../reducer";
import { emptyResources, shuffleArray } from "../../../../tests/utils";
import { GameData, ResourceType } from "../../../../types";
import { initiateTestingPlayers } from "../initiateTestingPlayers/initiateTestingPlayers.simulator";
import { giveResourcesToPlayer } from "./giveResourcesToPlayer.simulator";

it("giveResourcesToPlayer", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let player1: string;

  // Reducer data setup
  const { result: hookResult } = renderHook(() =>
    React.useReducer(reducer, {
      users: {},
      thefts: [],
    })
  );
  result = hookResult;

  const giveResources = [
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.STONE,
  ];

  // Creates the players and its initial resources
  act(() => initiateTestingPlayers(result.current[1], true));

  // Picking a random player
  const players = Object.keys(result.current[0].users);
  [player1] = shuffleArray(players);

  act(() =>
    giveResourcesToPlayer(
      result.current[1],
      player1,
      giveResources,
      result.current[0].users[player1].config.color
    )
  );

  expect(result.current[0].users[player1].resources).toStrictEqual({
    ...emptyResources,
    [ResourceType.STONE]: 1,
    [ResourceType.WOOD]: 2,
  });
});
