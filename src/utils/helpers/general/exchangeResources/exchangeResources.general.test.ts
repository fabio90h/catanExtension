import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../../reducer";
import { emptyResources, shuffleArray } from "../../../../tests/utils";
import { GameData, ResourceType } from "../../../../types";
import {
  givePlayersInitialResources,
  initiateTestingPlayers,
} from "../../forTest/testing.helpers";
import { exchangeResources } from "./exchangeResources.general";

describe("exchangeResources", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let offeringPlayer: string;
  let agreeingPlayer: string;

  beforeEach(() => {
    // Reducer data setup
    const { result: hookResult } = renderHook(() =>
      React.useReducer(reducer, {
        users: {},
        thefts: [],
      })
    );
    result = hookResult;

    // Creates the players and its initial resources
    act(() => initiateTestingPlayers(result.current[1], true));

    // Picking a random player
    const players = Object.keys(result.current[0].users);
    [offeringPlayer, agreeingPlayer] = shuffleArray(players);
  });

  it("exchanges successfully", () => {
    // Add the resources to make sure the user has the necessary resources to buy
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [offeringPlayer]: [ResourceType.SHEEP],
          [agreeingPlayer]: [ResourceType.WHEAT],
        },
        result.current[0].users
      )
    );

    act(() => {
      exchangeResources(
        result.current[1],
        offeringPlayer,
        agreeingPlayer,
        [ResourceType.SHEEP] //sending sheep
      );
    });

    expect(result.current[0].users[offeringPlayer].resources).toStrictEqual({
      ...emptyResources,
    });
    expect(result.current[0].users[agreeingPlayer].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.WHEAT]: 1,
      [ResourceType.SHEEP]: 1,
    });
  });
});
