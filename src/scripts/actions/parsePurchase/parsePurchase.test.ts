import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";

import { GameData, PurchaseType, ResourceType } from "../../../types";
import { emptyResources, testData } from "../../../utils/data";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";

import { givePlayersInitialResources } from "../../../utils/helpers/simulator/givePlayersInitialResources";
import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { playerMakesPurchase } from "../../../utils/helpers/simulator/playerMakesPurchase";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";

describe("Spending resources works as expected", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let playerName: string;
  let stealerName: string;
  let stealer2: string;

  beforeEach(() => {
    // Create the store
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
    [playerName, stealerName, stealer2] = shuffleArray(players);
  });

  describe("Build road", () => {
    it("Builds it correctly", () => {
      // Add the resources to make sure the user has the necessary resources to buy
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          playerName,
          testData.purchase.ROAD,
          result.current[0].users[playerName].config.color
        );
      });
      // Purchases a road
      act(() => {
        playerMakesPurchase(
          result.current[1],
          playerName,
          PurchaseType.ROAD,
          result.current[0].users[playerName].config.color
        );
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual(
        emptyResources
      );
      //   Check resource with errors
      const errorResources = { ...emptyResources };
      errorResources.BRICK = 1;
      expect(result.current[0].users[playerName].resources).not.toStrictEqual(
        errorResources
      );
    });
    describe("Review steal", () => {
      it("Resolves when stealer uses stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
              [playerName]: [ResourceType.WOOD, ResourceType.SHEEP],
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
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.ROAD,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);

        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
        });
      });
      it("Resolves when victim uses possible stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
              [playerName]: [
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
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.ROAD,
            result.current[0].users[stealerName].config.color
          );
        });
        // Theft should be resolved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 0,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual(
          emptyResources
        );
      });
      it("Does not resolves when stealer does not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.WHEAT,
              ],
              [playerName]: [ResourceType.STONE, ResourceType.SHEEP],
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
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.ROAD,
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
              [ResourceType.STONE]: 1,
              [ResourceType.SHEEP]: 1,
            },
          },
        ]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Does not resolves when victim not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.STONE, ResourceType.SHEEP],
              [playerName]: [ResourceType.SHEEP, ResourceType.WHEAT],
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
        // Give road resources to playerName
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase.ROAD,
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
              [ResourceType.SHEEP]: 1,
              [ResourceType.WHEAT]: 1,
            },
          },
        ]);
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.ROAD,
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
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 0,
        });
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.STONE, ResourceType.SHEEP],
              [playerName]: [
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
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.ROAD,
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
              [ResourceType.STONE]: 1,
            },
          },
        ]);

        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Checks the available resources in play to resolve theft. (Double steal)", () => {});
    });
  });
  describe("Build settlement", () => {
    it("Builds it correctly", () => {
      // Add the resources to make sure the user has the necessary resources to buy
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          playerName,
          testData.purchase.SETTLEMENT,
          result.current[0].users[playerName].config.color
        );
      });
      // Purchases a settlement
      act(() => {
        playerMakesPurchase(
          result.current[1],
          playerName,
          PurchaseType.SETTLEMENT,
          result.current[0].users[playerName].config.color
        );
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual(
        emptyResources
      );

      //   Check resource with errors
      const errorResources = { ...emptyResources };
      errorResources.BRICK = 1;
      expect(result.current[0].users[playerName].resources).not.toStrictEqual(
        errorResources
      );
    });
    describe("Resolves steal", () => {
      it("Resolves when stealer uses stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.BRICK,
                ResourceType.WHEAT,
                ResourceType.WOOD,
              ],
              [playerName]: [
                ResourceType.WOOD,
                ResourceType.SHEEP,
                ResourceType.WHEAT,
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
        // Purchases a settlement
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.SETTLEMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);

        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual(
          emptyResources
        );
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 1,
        });
      });
      it("Resolves when victim uses possible stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.BRICK,
                ResourceType.WHEAT,
                ResourceType.WOOD,
              ],
              [playerName]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.SHEEP,
                ResourceType.WHEAT,
                ResourceType.STONE,
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
        // Purchases a settlement
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.SETTLEMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Theft should be resolved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.STONE]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual(
          emptyResources
        );
      });
      it("Does not resolves when stealer does not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.WHEAT,
                ResourceType.SHEEP,
              ],
              [playerName]: [
                ResourceType.STONE,
                ResourceType.SHEEP,
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
        // Purchases a settlement
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.SETTLEMENT,
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
              [ResourceType.STONE]: 1,
              [ResourceType.SHEEP]: 2,
            },
          },
        ]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 2,
          [ResourceType.STONE]: 1,
        });
      });
      it("Does not resolves when victim not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.STONE, ResourceType.SHEEP],
              [playerName]: [ResourceType.STONE, ResourceType.WHEAT],
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
        // Give settlement resources to playerName
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase.SETTLEMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(1);
        // Purchases a road
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.SETTLEMENT,
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
              [ResourceType.STONE]: 1,
            },
          },
        ]);
        // Check players resources
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
          [ResourceType.STONE]: 1,
        });
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.SHEEP],
              [playerName]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.BRICK,
                ResourceType.WHEAT,
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
        // Purchases a settlement
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.SETTLEMENT,
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
              [ResourceType.WHEAT]: 2,
              [ResourceType.BRICK]: 2,
              [ResourceType.STONE]: 1,
            },
          },
        ]);

        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Checks the available resources in play to resolve theft. (Double steal)", () => {});
    });
  });
  describe("Build city", () => {
    it("Builds it correctly", () => {
      // Add the resources to make sure the user has the necessary resources to buy
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          playerName,
          testData.purchase.CITY,
          result.current[0].users[playerName].config.color
        );
      });
      // Purchases a city
      act(() => {
        playerMakesPurchase(
          result.current[1],
          playerName,
          PurchaseType.CITY,
          result.current[0].users[playerName].config.color
        );
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual(
        emptyResources
      );

      //   Check resource with errors
      const errorResources = { ...emptyResources };
      errorResources.BRICK = 1;
      expect(result.current[0].users[playerName].resources).not.toStrictEqual(
        errorResources
      );
    });
    describe("Resolves steal", () => {});
  });
  describe("Buys development card", () => {
    it("Buys it correctly", () => {
      // Add the resources to make sure the user has the necessary resources to buy
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          playerName,
          testData.purchase[PurchaseType.DEVELOPMENT],
          result.current[0].users[playerName].config.color
        );
      });
      // Purchases a development card
      act(() => {
        playerMakesPurchase(
          result.current[1],
          playerName,
          PurchaseType.DEVELOPMENT,
          result.current[0].users[playerName].config.color
        );
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual(
        emptyResources
      );

      //   Check resource with errors
      const errorResources = { ...emptyResources };
      errorResources.BRICK = 1;
      expect(result.current[0].users[playerName].resources).not.toStrictEqual(
        errorResources
      );
    });
    describe("Resolves steal", () => {
      it("Resolves when stealer uses stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.STONE,
                ResourceType.WHEAT,
                ResourceType.WHEAT,
              ],
              [playerName]: [ResourceType.WOOD, ResourceType.SHEEP],
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
        // Purchases a development card
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.DEVELOPMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);

        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
        });
      });
      it("Resolves when victim uses possible stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
              [playerName]: [
                ResourceType.BRICK,
                ResourceType.SHEEP,
                ResourceType.STONE,
                ResourceType.WHEAT,
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
        // Purchases a development card
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.DEVELOPMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Theft should be resolved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 2,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual(
          emptyResources
        );
      });
      it("Does not resolve when stealer does not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.SHEEP,
                ResourceType.STONE,
                ResourceType.WHEAT,
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
        // Purchases a development card
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.DEVELOPMENT,
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
        expect(result.current[0].users[stealerName].resources).toStrictEqual(
          emptyResources
        );
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.BRICK]: 2,
        });
      });
      it("Does not resolves when victim not use stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.STONE, ResourceType.WHEAT],
              [playerName]: [ResourceType.BRICK, ResourceType.WOOD],
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
        // Give development resource to playerName
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase.DEVELOPMENT,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(1);
        // Purchases a development card
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.DEVELOPMENT,
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
              [ResourceType.WOOD]: 1,
            },
          },
        ]);
        // Check players resources
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.BRICK]: 1,
        });
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WHEAT]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      it("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [ResourceType.WOOD, ResourceType.STONE],
              [playerName]: [
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
        // Purchases a development card
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.DEVELOPMENT,
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
          [ResourceType.WOOD]: 1,
          [ResourceType.STONE]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.BRICK]: 1,
        });
      });
      it("Checks the available resources in play to resolve theft. (Double steal)", () => {});
    });
  });
});
