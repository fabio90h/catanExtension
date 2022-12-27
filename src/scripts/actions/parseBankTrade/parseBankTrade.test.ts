import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";
import { emptyResources, shuffleArray } from "../../../tests/utils";
import { GameData, ResourceType } from "../../../types";
import { bankTrade } from "../../../utils/helpers/simulator/bankTrade";
import { givePlayersInitialResources } from "../../../utils/helpers/simulator/givePlayersInitialResources";
import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";

describe("trading with bank", () => {
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

  it("4 to 1 trade", () => {
    // Add the resources to make sure the user has the necessary resources to buy
    act(() => {
      giveResourcesToPlayer(
        result.current[1],
        offeringPlayer,
        [
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
        ],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    // Purchases a road
    act(() => {
      bankTrade(
        result.current[1],
        offeringPlayer,
        [
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
          ResourceType.BRICK,
        ],
        [ResourceType.WOOD],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    expect(result.current[0].users[offeringPlayer].resources).toStrictEqual({
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    });
    expect(result.current[0].users[offeringPlayer].resources).not.toStrictEqual(
      emptyResources
    );
  });
  it("3 to 1 trade", () => {
    // Add the resources to make sure the user has the necessary resources to buy
    act(() => {
      giveResourcesToPlayer(
        result.current[1],
        offeringPlayer,
        [ResourceType.BRICK, ResourceType.BRICK, ResourceType.BRICK],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    // Purchases a road
    act(() => {
      bankTrade(
        result.current[1],
        offeringPlayer,
        [ResourceType.BRICK, ResourceType.BRICK, ResourceType.BRICK],
        [ResourceType.WHEAT],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    expect(result.current[0].users[offeringPlayer].resources).toStrictEqual({
      [ResourceType.WOOD]: 0,
      [ResourceType.WHEAT]: 1,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    });
    expect(result.current[0].users[offeringPlayer].resources).not.toStrictEqual(
      emptyResources
    );
  });
  it("2 to 1 trade", () => {
    // Add the resources to make sure the user has the necessary resources to buy
    act(() => {
      giveResourcesToPlayer(
        result.current[1],
        offeringPlayer,
        [ResourceType.SHEEP, ResourceType.SHEEP],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    // Purchases a road
    act(() => {
      bankTrade(
        result.current[1],
        offeringPlayer,
        [ResourceType.SHEEP, ResourceType.SHEEP],
        [ResourceType.STONE],
        result.current[0].users[offeringPlayer].config.color
      );
    });

    expect(result.current[0].users[offeringPlayer].resources).toStrictEqual({
      [ResourceType.WOOD]: 0,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 1,
    });
    expect(result.current[0].users[offeringPlayer].resources).not.toStrictEqual(
      emptyResources
    );
  });
  describe("Resolves steal", () => {
    it("Resolves when stealer uses stolen resource needed for bank trade.", () => {
      // Initialize resources and theft
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;

      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [offeringPlayer]: [
              ResourceType.BRICK,
              ResourceType.BRICK,
              ResourceType.BRICK,
            ],
            [agreeingPlayer]: [
              ResourceType.WOOD,
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
      // Trade with bank
      act(() => {
        bankTrade(
          result.current[1],
          stealerName,
          [
            ResourceType.BRICK,
            ResourceType.BRICK,
            ResourceType.BRICK,
            ResourceType.BRICK,
          ],
          [ResourceType.STONE],
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
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.SHEEP]: 1,
      });
    });
    it("Resolves when victim uses possible stolen resource needed for bank trade.", () => {
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
              ResourceType.WHEAT,
            ],
            [playerName]: [
              ResourceType.WHEAT,
              ResourceType.WHEAT,
              ResourceType.WHEAT,
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
      // Trade with bank
      act(() => {
        bankTrade(
          result.current[1],
          playerName,
          [ResourceType.WHEAT, ResourceType.WHEAT, ResourceType.WHEAT],
          [ResourceType.BRICK],
          result.current[0].users[playerName].config.color
        );
      });
      // Theft should be resolved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Does not resolve when stealer does not use stolen resource needed for bank trade.", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [
              ResourceType.SHEEP,
              ResourceType.SHEEP,
              ResourceType.SHEEP,
            ],
            [playerName]: [
              ResourceType.WOOD,
              ResourceType.BRICK,
              ResourceType.BRICK,
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
      // Trade with bank
      act(() => {
        bankTrade(
          result.current[1],
          stealerName,
          [ResourceType.SHEEP, ResourceType.SHEEP, ResourceType.SHEEP],
          [ResourceType.BRICK],
          result.current[0].users[stealerName].config.color
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
            [ResourceType.BRICK]: 2,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 2,
      });
    });
    it("Does not resolves when victim not use stolen resource needed for bank trade.", () => {
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
      // Trade with bank
      act(() => {
        bankTrade(
          result.current[1],
          playerName,
          [ResourceType.WOOD, ResourceType.WOOD, ResourceType.WOOD],
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
            [ResourceType.WOOD]: 4,
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
        [ResourceType.WHEAT]: 1,
        [ResourceType.STONE]: 1,
      });
    });
    it("Possible stolen resources are diminished when victim bank trade with possible stolen resource", () => {
      const stealerName = offeringPlayer;
      const playerName = agreeingPlayer;
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.WOOD, ResourceType.STONE],
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
      // Trade with bank
      act(() => {
        bankTrade(
          result.current[1],
          playerName,
          [ResourceType.WOOD, ResourceType.WOOD],
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
            [ResourceType.BRICK]: 1,
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
            [ResourceType.STONE]: 1,
          },
        },
      ]);

      // Check players resources
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 2,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.STONE]: 1,
      });
    });
    it("Checks the available resources in play to resolve theft. (Double steal)", () => {});
  });
});
