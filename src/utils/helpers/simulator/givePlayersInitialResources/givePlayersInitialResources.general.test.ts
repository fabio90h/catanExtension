import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../../reducer";

import { GameData, ResourceType } from "../../../../types";
import { initiateTestingPlayers } from "../initiateTestingPlayers";
import { givePlayersInitialResources } from ".";
import { emptyResources } from "../../../data";
import { shuffleArray } from "../../general/shuffleArray/shuffleArray.general";

it("givePlayersInitialResources", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let player1: string;
  let player2: string;

  // Reducer data setup
  const { result: hookResult } = renderHook(() =>
    React.useReducer(reducer, {
      users: {},
      thefts: [],
    })
  );
  result = hookResult;

  const player1Resources = [
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.STONE,
  ];

  const player2Resources = [
    ResourceType.WOOD,
    ResourceType.WHEAT,
    ResourceType.STONE,
    ResourceType.SHEEP,
  ];

  // Creates the players and its initial resources
  act(() => initiateTestingPlayers(result.current[1], true));

  // Picking a random player
  const players = Object.keys(result.current[0].users);
  [player1, player2] = shuffleArray(players);

  act(() =>
    givePlayersInitialResources(
      result.current[1],
      {
        [player1]: player1Resources,
        [player2]: player2Resources,
      },
      result.current[0].users
    )
  );

  expect(result.current[0].users[player1].resources).toStrictEqual({
    ...emptyResources,
    [ResourceType.STONE]: 1,
    [ResourceType.WOOD]: 2,
  });
  expect(result.current[0].users[player2].resources).toStrictEqual({
    ...emptyResources,
    [ResourceType.STONE]: 1,
    [ResourceType.WOOD]: 1,
    [ResourceType.WHEAT]: 1,
    [ResourceType.SHEEP]: 1,
  });
});
