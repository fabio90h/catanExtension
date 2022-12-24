import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../../reducer";
import { shuffleArray, emptyResources } from "../../../../tests/utils";
import { GameData, ResourceType } from "../../../../types";
import { givePlayersInitialResources } from "../givePlayersInitialResources/givePlayersInitialResources.general";
import { initiateTestingPlayers } from "../initiateTestingPlayers/initiateTestingPlayers.simulator";
import { bankTrade } from "./bankTrade.simulator";

it("bankTrade correctly", () => {
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

  const player1Resources = [
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
    givePlayersInitialResources(
      result.current[1],
      {
        [player1]: [
          ResourceType.WOOD,
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.STONE,
        ],
      },
      result.current[0].users
    )
  );

  // Trade with bank
  act(() => {
    bankTrade(
      result.current[1],
      player1,
      [
        ResourceType.BRICK,
        ResourceType.BRICK,
        ResourceType.BRICK,
        ResourceType.BRICK,
      ],
      [ResourceType.STONE],
      result.current[0].users[player1].config.color
    );
  });

  expect(result.current[0].users[player1].resources).toStrictEqual({
    ...emptyResources,
    [ResourceType.STONE]: 2,
    [ResourceType.WOOD]: 1,
  });
});
