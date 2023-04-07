import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";
import { GameData, ResourceType } from "../../../types";
import { emptyResources } from "../../../utils/data";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";
import { givePlayersInitialResources } from "../../../utils/helpers/simulator/givePlayersInitialResources";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";
import keywords from "../../../utils/keywords";
import { manuallyResolveUnknownTheft } from "./manuallyResolveUnknownTheft.action";

describe("Manually resolving theft", () => {
  let player: string;
  let player2: string;
  let stealerName: string;
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  beforeEach(() => {
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
    [player, player2, stealerName] = shuffleArray(players);
  });
  it("Resolves successfully (1 layer)", () => {
    // Give resources to player
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [stealerName]: [ResourceType.STONE],
          [player2]: [
            ResourceType.WHEAT,
            ResourceType.BRICK,
            ResourceType.SHEEP,
          ],
          [player]: [ResourceType.WHEAT, ResourceType.BRICK],
        },
        result.current[0].users
      )
    );
    // Unknown steal occurred
    act(() =>
      unknownSteal(
        result.current[1],
        player2,
        stealerName,
        result.current[0].users[stealerName].config.color
      )
    );
    // Check the theft record
    expect(result.current[0].thefts).toHaveLength(1);
    // Manually resolve theft
    act(() => {
      manuallyResolveUnknownTheft(
        result.current[1],
        ResourceType.WHEAT,
        stealerName,
        player2,
        0
      );
    });
    // Check the theft record
    expect(result.current[0].thefts).toHaveLength(0);
    expect(result.current[0].thefts).toStrictEqual([]);
    // Check players resources
    expect(result.current[0].users[stealerName].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.STONE]: 1,
      [ResourceType.WHEAT]: 1,
    });
    expect(result.current[0].users[player].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.BRICK]: 1,
      [ResourceType.WHEAT]: 1,
    });
    expect(result.current[0].users[player2].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.BRICK]: 1,
      [ResourceType.SHEEP]: 1,
    });
  });
  it("Resolves successfully (1 layer) and reduces theft possibilities (layer 2)", () => {
    // Give resources to player
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [stealerName]: [],
          [player2]: [ResourceType.WOOD, ResourceType.BRICK],
          [player]: [ResourceType.WHEAT],
        },
        result.current[0].users
      )
    );
    // Unknown steal stealerName steals player2
    act(() =>
      unknownSteal(
        result.current[1],
        player2,
        stealerName,
        result.current[0].users[stealerName].config.color
      )
    );
    // Unknown steal player steals stealerName
    act(() =>
      unknownSteal(
        result.current[1],
        stealerName,
        player,
        result.current[0].users[player].config.color
      )
    );
    expect(result.current[0].thefts).toHaveLength(1);
    // Manually resolve theft
    const index = 0;
    act(() => {
      manuallyResolveUnknownTheft(
        result.current[1],
        ResourceType.WOOD,
        result.current[0].thefts[index].who.stealer,
        result.current[0].thefts[index].who.victim,
        index
      );
    });
    // Check the theft record
    expect(result.current[0].thefts).toHaveLength(0);
    expect(result.current[0].thefts).toStrictEqual([]);
    // Check players resources
    expect(result.current[0].users[stealerName].resources).toStrictEqual({
      ...emptyResources,
    });
    expect(result.current[0].users[player].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 1,
    });
    expect(result.current[0].users[player2].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.BRICK]: 1,
    });
  });
});
