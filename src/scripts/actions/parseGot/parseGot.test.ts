import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { reducer } from "../../../reducer";

import { ResourceType } from "../../../types";
import { emptyResources, testData } from "../../../utils/data";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";

import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import keywords from "../../../utils/keywords";

it("Adds resources when 'got' message appears", () => {
  const { result } = renderHook(() =>
    React.useReducer(reducer, {
      username: keywords.userName,
      users: {},
      thefts: [],
    })
  );

  act(() => initiateTestingPlayers(result.current[1], true));

  const players = Object.keys(result.current[0].users);
  const playerName = shuffleArray(players)[0];

  act(() =>
    giveResourcesToPlayer(
      result.current[1],
      playerName,
      [
        ResourceType.WOOD,
        ResourceType.WOOD,
        ResourceType.WOOD,
        ResourceType.BRICK,
        ...testData.purchase.SETTLEMENT,
      ],
      result.current[0].users[playerName].config.color
    )
  );

  expect(result.current[0].users[playerName].resources).toStrictEqual({
    [ResourceType.WOOD]: 4,
    [ResourceType.WHEAT]: 1,
    [ResourceType.BRICK]: 2,
    [ResourceType.SHEEP]: 1,
    [ResourceType.STONE]: 0,
  });

  expect(result.current[0].users[playerName].resources).not.toStrictEqual(
    emptyResources
  );
});
