import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";

import { GameData, ResourceType } from "../../../types";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";
import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { yearOfPlenty } from "../../../utils/helpers/simulator/yearOfPlenty";
import keywords from "../../../utils/keywords";

it("Successfully executes 'Year of Plenty", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  // Reducer data setup
  const { result: hookResult } = renderHook(() =>
    React.useReducer(reducer, {
      username: keywords.userName,
      users: {},
      thefts: [],
    })
  );

  result = hookResult;

  // Creates the players and its initial resources
  act(() => initiateTestingPlayers(result.current[1], true));
  // Picking a random player
  const players = Object.keys(result.current[0].users);
  const playerPlayingYearOfPlenty = shuffleArray(players)[0];

  // Add resources playerPlayingYearOfPlenty
  act(() => {
    giveResourcesToPlayer(
      result.current[1],
      playerPlayingYearOfPlenty,
      [ResourceType.BRICK, ResourceType.WOOD, ResourceType.WHEAT],
      result.current[0].users[playerPlayingYearOfPlenty].config.color
    );
  });

  act(() =>
    yearOfPlenty(
      result.current[1],
      playerPlayingYearOfPlenty,
      result.current[0].users[playerPlayingYearOfPlenty].config.color,
      [ResourceType.BRICK, ResourceType.WOOD]
    )
  );
  expect(
    result.current[0].users[playerPlayingYearOfPlenty].resources
  ).toStrictEqual({
    [ResourceType.WOOD]: 2,
    [ResourceType.WHEAT]: 1,
    [ResourceType.BRICK]: 2,
    [ResourceType.SHEEP]: 0,
    [ResourceType.STONE]: 0,
  });
});
