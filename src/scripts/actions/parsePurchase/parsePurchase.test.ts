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
import keywords from "../../../utils/keywords";

describe("Spending resources works as expected", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let playerName: string;
  let stealerName: string;
  let stealer2: string;

  beforeEach(() => {
    // Create the store
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
      describe("Multiple unknown steals", () => {
        /**
         * victim -> stealer
         * victim -> stealer
         * victim buys road
         * SOLVES theft
         */
        it("should resolve when victim buys a road after a double steal from same stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
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
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 2,
            [ResourceType.SHEEP]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * victim buys road
         * REDUCES theft
         */
        it("should reduce theft possibility when victim buys a road after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * stealer buys road with stolen resources from victim
         * SOLVES and REDUCES theft
         */
        it("should resolve and reduce theft possibilities when stealer buys a road after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

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
              what: { SHEEP: 1, WHEAT: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
        /**
         * victim -> stealer -> stealer2
         * stealer2 buys road with stolen resources from victim
         * SOLVES theft
         */
        it.skip("should resolve theft possibility when stealer2 buys a road after a steal from stealer1 using the resource from stealer1's victim", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.STONE, ResourceType.WHEAT],
                [stealer2]: [ResourceType.BRICK, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              stealerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { STONE: 1, WHEAT: 1 },
              who: { stealer: stealer2, victim: stealerName },
            },
          ]);

          // Purchases a road
          act(() => {
            playerMakesPurchase(
              result.current[1],
              stealer2,
              PurchaseType.ROAD,
              result.current[0].users[stealer2].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.STONE]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
      });
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
      describe("Multiple unknown steals", () => {
        /**
         * victim -> stealer
         * victim -> stealer
         * victim buys settlement
         * SOLVES theft
         */
        it("should resolve when victim buys a settlement after a double steal from same stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
                  ResourceType.SHEEP,
                  ResourceType.STONE,
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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 2, BRICK: 1, STONE: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 2, BRICK: 1, STONE: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
          ]);

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
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.WHEAT]: 1,
            [ResourceType.STONE]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * victim buys settlement
         * REDUCES theft
         */
        it("should reduce theft possibility when victim buys a settlement after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
                  ResourceType.SHEEP,
                  ResourceType.SHEEP,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 2, WHEAT: 1, WOOD: 1, BRICK: 1, STONE: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 2, WHEAT: 1, WOOD: 1, BRICK: 1, STONE: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, STONE: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, STONE: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.SHEEP]: 1,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * stealer buys settlement with stolen resources from victim
         * SOLVES and REDUCES theft
         */
        it("should resolve and reduce theft possibilities when stealer buys a settlement after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [
                  ResourceType.BRICK,
                  ResourceType.WOOD,
                  ResourceType.STONE,
                  ResourceType.STONE,
                  ResourceType.WHEAT,
                ],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Purchases a road
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
              what: { WHEAT: 1, BRICK: 1, WOOD: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 2,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
      });
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
    describe("Resolves steal", () => {
      /**
       * victim -> stealer
       * stealer buys city
       * SOLVES theft
       */
      it("Resolves when stealer uses stolen resource needed for purchase.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealerName]: [
                ResourceType.WHEAT,
                ResourceType.STONE,
                ResourceType.STONE,
                ResourceType.STONE,
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
        // Purchases a city
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.CITY,
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
          [ResourceType.SHEEP]: 1,
        });
      });
      /**
       * victim -> stealer
       * victim buys city
       * SOLVES theft
       */
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
                ResourceType.WHEAT,
                ResourceType.WHEAT,
                ResourceType.WHEAT,
                ResourceType.STONE,
                ResourceType.STONE,
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
        // Purchases a city
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.CITY,
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
          [ResourceType.WHEAT]: 2,
          [ResourceType.BRICK]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual(
          emptyResources
        );
      });
      /**
       * victim -> stealer
       * stealer buys city (stolen resource not used)
       * UNRESOLVED theft
       */
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
                ResourceType.WHEAT,
                ResourceType.STONE,
                ResourceType.STONE,
                ResourceType.STONE,
              ],
              [playerName]: [
                ResourceType.STONE,
                ResourceType.SHEEP,
                ResourceType.SHEEP,
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
        // Purchases a city
        act(() => {
          playerMakesPurchase(
            result.current[1],
            stealerName,
            PurchaseType.CITY,
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
              [ResourceType.STONE]: 1,
              [ResourceType.SHEEP]: 2,
            },
          },
        ]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.BRICK]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 2,
          [ResourceType.STONE]: 1,
          [ResourceType.WOOD]: 1,
        });
      });
      /**
       * victim -> stealer
       * victim buys city (stolen resource not used)
       * UNRESOLVED theft
       */
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
        // Give city resources to playerName
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase.CITY,
            result.current[0].users[stealerName].config.color
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(1);
        // Purchases a city
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.CITY,
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
      /**
       * victim -> stealer
       * victim buys city (maybe stolen resource used)
       * REDUCE theft
       */
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
                ResourceType.STONE,
                ResourceType.WHEAT,
                ResourceType.WHEAT,
                ResourceType.STONE,
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
        // Purchases a city
        act(() => {
          playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.CITY,
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
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
          [ResourceType.BRICK]: 1,
        });
      });
      describe("Multiple unknown steals", () => {
        /**
         * victim -> stealer
         * victim -> stealer
         * victim buys city
         * SOLVES theft
         */
        it("should resolve when victim buys a city after a double steal from same stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [playerName]: [ResourceType.WOOD, ResourceType.STONE],
              },
              result.current[0].users
            )
          );

          // Give city resources to playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              testData.purchase.CITY,
              result.current[0].users[stealerName].config.color
            );
          });

          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[stealerName].config.color
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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WHEAT: 2, WOOD: 1, STONE: 4 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WHEAT: 2, WOOD: 1, STONE: 4 },
              who: { stealer: stealerName, victim: playerName },
            },
          ]);

          // Purchases a city
          act(() => {
            playerMakesPurchase(
              result.current[1],
              playerName,
              PurchaseType.CITY,
              result.current[0].users[playerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.STONE]: 1,
            [ResourceType.BRICK]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * victim buys city
         * REDUCES theft
         */
        it("should reduce theft possibility when victim buys a city after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [ResourceType.WOOD, ResourceType.BRICK],
              },
              result.current[0].users
            )
          );

          // Give city resources to playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              testData.purchase.CITY,
              result.current[0].users[stealerName].config.color
            );
          });

          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[stealerName].config.color
            )
          );
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WHEAT: 2, STONE: 3, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WHEAT: 2, STONE: 3, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Purchases a city
          act(() => {
            playerMakesPurchase(
              result.current[1],
              playerName,
              PurchaseType.CITY,
              result.current[0].users[playerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * stealer buys city with stolen resources from victim
         * SOLVES and REDUCES theft
         */
        it("should resolve and reduce theft possibilities when stealer buys a city after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
                  ResourceType.STONE,
                  ResourceType.STONE,
                  ResourceType.STONE,
                ],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Purchases a city
          act(() => {
            playerMakesPurchase(
              result.current[1],
              stealerName,
              PurchaseType.CITY,
              result.current[0].users[stealerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(1);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, BRICK: 1, WOOD: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.SHEEP]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
      });
    });
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
      /**
       * victim -> stealer
       * stealer buys dev card (with stolen resource)
       * SOLVES theft
       */
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
      /**
       * victim -> stealer
       * victim buys dev card (with thought to be stolen resource)
       * SOLVES theft
       */
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
      /**
       * victim -> stealer
       * stealer buys dev card (not with stolen resource)
       * UNRESOLVED theft
       */
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
      /**
       * victim -> stealer
       * victim buys dev card (not with stolen resource)
       * UNRESOLVED theft
       */
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
      /**
       * victim -> stealer
       * victim buys dev card (with possible stolen resource)
       * REDUCE theft
       */
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
      describe("Multiple unknown steals", () => {
        /**
         * victim -> stealer
         * victim -> stealer
         * victim buys dev card
         * SOLVES theft
         */
        it("should resolve when victim buys a dev card after a double steal from same stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [playerName]: [ResourceType.WOOD, ResourceType.STONE],
              },
              result.current[0].users
            )
          );

          // Give dev card  resources to playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              testData.purchase.DEVELOPMENT,
              result.current[0].users[stealerName].config.color
            );
          });

          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[stealerName].config.color
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
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WHEAT: 1, WOOD: 1, STONE: 2, SHEEP: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WHEAT: 1, WOOD: 1, STONE: 2, SHEEP: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
          ]);

          // Purchases a dev card
          act(() => {
            playerMakesPurchase(
              result.current[1],
              playerName,
              PurchaseType.DEVELOPMENT,
              result.current[0].users[playerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.STONE]: 1,
            [ResourceType.BRICK]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * victim buys city
         * REDUCES theft
         */
        it("should reduce theft possibility when victim buys a dev card after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [ResourceType.BRICK, ResourceType.WHEAT],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [ResourceType.WOOD, ResourceType.BRICK],
              },
              result.current[0].users
            )
          );

          // Give dev card resources to playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              testData.purchase.DEVELOPMENT,
              result.current[0].users[stealerName].config.color
            );
          });

          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[stealerName].config.color
            )
          );
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WHEAT: 1, STONE: 1, WOOD: 1, BRICK: 1, SHEEP: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WHEAT: 1, STONE: 1, WOOD: 1, BRICK: 1, SHEEP: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Purchases a dev card
          act(() => {
            playerMakesPurchase(
              result.current[1],
              playerName,
              PurchaseType.DEVELOPMENT,
              result.current[0].users[playerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
        /**
         * victim -> stealer
         * victim -> stealer2
         * stealer buys city with stolen resources from victim
         * SOLVES and REDUCES theft
         */
        it("should resolve and reduce theft possibilities when stealer buys a dev card after a double steal from different stealer", () => {
          // Initialize resources and theft
          act(() =>
            givePlayersInitialResources(
              result.current[1],
              {
                [stealerName]: [
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
                  ResourceType.STONE,
                  ResourceType.STONE,
                  ResourceType.STONE,
                ],
                [stealer2]: [ResourceType.STONE, ResourceType.WHEAT],
                [playerName]: [
                  ResourceType.WOOD,
                  ResourceType.BRICK,
                  ResourceType.WHEAT,
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
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealer2,
              result.current[0].users[stealer2].config.color
            )
          );
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(2);
          expect(result.current[0].thefts).toStrictEqual([
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealerName, victim: playerName },
            },
            {
              what: { SHEEP: 1, WHEAT: 1, WOOD: 1, BRICK: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Purchases a dev card
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
              what: { WHEAT: 1, BRICK: 1, WOOD: 1 },
              who: { stealer: stealer2, victim: playerName },
            },
          ]);

          // Check players resources
          expect(result.current[0].users[stealerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.BRICK]: 1,
            [ResourceType.STONE]: 2,
          });
          expect(result.current[0].users[stealer2].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          });
          expect(result.current[0].users[playerName].resources).toStrictEqual({
            ...emptyResources,
            [ResourceType.WOOD]: 1,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          });
        });
      });
    });
  });
});
