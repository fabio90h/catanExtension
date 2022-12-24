import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../../reducer";
import { shuffleArray, emptyResources } from "../../../../tests/utils";
import { GameData, ResourceType, PurchaseType } from "../../../../types";
import { givePlayersInitialResources } from "../givePlayersInitialResources/givePlayersInitialResources.general";
import { initiateTestingPlayers } from "../initiateTestingPlayers/initiateTestingPlayers.simulator";
import { playerMakesPurchase } from "./playerMakesPurchase.general";

describe("playerMakesPurchase", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let player1: string;

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
    [player1] = shuffleArray(players);
  });

  it("builds road correctly", () => {
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [player1]: [
            ResourceType.WOOD,
            ResourceType.BRICK,
            ResourceType.STONE,
          ],
        },
        result.current[0].users
      )
    );
    // Purchases a road
    act(() => {
      playerMakesPurchase(
        result.current[1],
        player1,
        PurchaseType.ROAD,
        result.current[0].users[player1].config.color
      );
    });

    expect(result.current[0].users[player1].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.STONE]: 1,
    });
  });

  it("builds settlement correctly", () => {
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [player1]: [
            ResourceType.WOOD,
            ResourceType.BRICK,
            ResourceType.WHEAT,
            ResourceType.STONE,
            ResourceType.SHEEP,
          ],
        },
        result.current[0].users
      )
    );
    // Purchases a road
    act(() => {
      playerMakesPurchase(
        result.current[1],
        player1,
        PurchaseType.SETTLEMENT,
        result.current[0].users[player1].config.color
      );
    });

    expect(result.current[0].users[player1].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.STONE]: 1,
    });
  });

  it("builds city correctly", () => {
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [player1]: [
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.WHEAT,
            ResourceType.WHEAT,
            ResourceType.SHEEP,
          ],
        },
        result.current[0].users
      )
    );
    // Purchases a road
    act(() => {
      playerMakesPurchase(
        result.current[1],
        player1,
        PurchaseType.CITY,
        result.current[0].users[player1].config.color
      );
    });

    expect(result.current[0].users[player1].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.SHEEP]: 1,
    });
  });

  it("buys development card", () => {
    act(() =>
      givePlayersInitialResources(
        result.current[1],
        {
          [player1]: [
            ResourceType.WHEAT,
            ResourceType.SHEEP,
            ResourceType.STONE,
            ResourceType.STONE,
          ],
        },
        result.current[0].users
      )
    );
    // Purchases a road
    act(() => {
      playerMakesPurchase(
        result.current[1],
        player1,
        PurchaseType.DEVELOPMENT,
        result.current[0].users[player1].config.color
      );
    });

    expect(result.current[0].users[player1].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.STONE]: 1,
    });
  });
});
