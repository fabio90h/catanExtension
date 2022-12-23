import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";
import { shuffleArray, emptyResources } from "../../../tests/utils";
import { GameData, ResourceType } from "../../../types";
import {
  initiateTestingPlayers,
  givePlayersInitialResources,
  playerTrade,
  unknownSteal,
} from "../../../utils/helpers/forTest/testing.helpers";

describe("trading with player", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let offeringPlayer: string;
  let agreeingPlayer: string;
  let player3: string;

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
    [offeringPlayer, agreeingPlayer, player3] = shuffleArray(players);
  });
  it("trades successfully", () => {
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
      playerTrade(
        result.current[1],
        offeringPlayer,
        agreeingPlayer,
        [ResourceType.SHEEP],
        [ResourceType.WHEAT],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    expect(result.current[0].users[offeringPlayer].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.WHEAT]: 1,
    });
    expect(result.current[0].users[agreeingPlayer].resources).toStrictEqual({
      ...emptyResources,
      [ResourceType.SHEEP]: 1,
    });
    expect(result.current[0].users[agreeingPlayer].resources).not.toStrictEqual(
      emptyResources
    );
  });
  describe("Resolves steal", () => {
    it("Resolves when stealer uses stolen resource needed for player trade.", () => {
      // Initialize resources and theft
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;

      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [
              ResourceType.STONE,
              ResourceType.WOOD,
              ResourceType.BRICK,
            ],
            [playerName]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
              ResourceType.SHEEP,
            ],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          playerName,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Trade with player
      act(() => {
        playerTrade(
          result.current[1],
          stealerName,
          playerName,
          [ResourceType.WHEAT],
          [ResourceType.SHEEP],
          result.current[0].users[stealerName].config.color
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.STONE]: 1,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
      });
    });
    it("Resolves when victim uses possible stolen resource needed for player trade.", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;

      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [
              ResourceType.BRICK,
              ResourceType.SHEEP,
              ResourceType.STONE,
            ],
            [playerName]: [
              ResourceType.WHEAT,
              ResourceType.WHEAT,
              ResourceType.WHEAT,
              ResourceType.WOOD,
              ResourceType.SHEEP,
            ],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          playerName,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);

      // Trade with player
      act(() => {
        playerTrade(
          result.current[1],
          playerName,
          stealerName,
          [ResourceType.SHEEP, ResourceType.WOOD],
          [ResourceType.STONE],
          result.current[0].users[playerName].config.color
        );
      });
      // Theft should be resolved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 2,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.WOOD]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.STONE]: 1,
        [ResourceType.WHEAT]: 2,
      });
    });
    it("Does not resolve when stealer does not use stolen resource needed for player trade.", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.WHEAT, ResourceType.STONE],
            [playerName]: [ResourceType.WOOD, ResourceType.BRICK],
            [player3]: [ResourceType.SHEEP],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          playerName,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Trade with player
      act(() => {
        playerTrade(
          result.current[1],
          stealerName,
          player3,
          [ResourceType.WHEAT],
          [ResourceType.SHEEP],
          result.current[0].users[playerName].config.color
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: playerName,
          },
          what: {
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[player3].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
      });
    });
    it.skip("Does not resolves when victim not use stolen resource needed for player trade.", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;

      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.STONE, ResourceType.WHEAT],
            [playerName]: [
              ResourceType.SHEEP,
              ResourceType.WOOD,
              ResourceType.WOOD,
            ],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          playerName,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Trade with player
      act(() => {
        playerTrade(
          result.current[1],
          playerName,
          stealerName,
          [ResourceType.WOOD],
          [ResourceType.WHEAT],
          result.current[0].users[playerName].config.color
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: playerName,
          },
          what: {
            [ResourceType.SHEEP]: 1,
            [ResourceType.WOOD]: 1,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.STONE]: 1,
      });
    });
    it("Possible stolen resources are diminished when victim trade with possible stolen resource", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.SHEEP, ResourceType.STONE],
            [playerName]: [
              ResourceType.WOOD,
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
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          playerName,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Trade with player
      act(() => {
        playerTrade(
          result.current[1],
          playerName,
          stealerName,
          [
            ResourceType.BRICK,
            ResourceType.STONE,
            ResourceType.WOOD,
            ResourceType.WOOD,
          ],
          [ResourceType.SHEEP],
          result.current[0].users[playerName].config.color
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: playerName,
          },
          what: {
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
          },
        },
      ]);

      // Check players resources
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 2,
      });
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 2,
        [ResourceType.STONE]: 2,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Checks the available resources in play to resolve theft. (Double steal)", () => {});
  });
});
