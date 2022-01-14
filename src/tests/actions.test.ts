import { Action, reducer } from "../reducer";
import React from "react";
import { recognizeUsers } from "../scripts/actionParser";
import keywords from "../utils/keywords";
import { GameData, PurchaseType, ResourceType } from "../types";
import { renderHook, RenderResult } from "@testing-library/react-hooks";
import { act } from "react-dom/test-utils";
import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
  initiateTestingPlayers,
  giveResourcesToPlayer,
  playerMakesPurchase,
  emptyResources,
  shuffleArray,
  bankTrade,
  playerTrade,
  monopoly,
  yearOfPlenty,
  discardCards,
  stoleFromOrByYou,
  unknownSteal,
  givePlayersInitialResources,
  maxMonopolyGain,
} from "./utils";
import testData from "./data";

describe("Action Tests", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;
  beforeEach(() => {
    const { result: hookResult } = renderHook(() =>
      React.useReducer(reducer, {
        users: {},
        thefts: [],
      })
    );
    result = hookResult;
  });
  it.skip("Recognizes players, their initial resources, and their color", () => {
    const users = createPlayersAndProperties();

    (Object.keys(users) as Array<keyof typeof users>).forEach((user) => {
      const node = createDivElement(
        users[user].config.color,
        user,
        keywords.placeInitialSettlementSnippet
      );

      (Object.keys(users[user].resources) as Array<ResourceType>).forEach(
        (resource) => {
          if (users[user].resources[resource] > 0)
            for (
              let index = 0;
              index < users[user].resources[resource];
              index++
            ) {
              createChildImgElement(node, resource);
            }
        }
      );

      act(() => recognizeUsers(node as HTMLElement, result.current[1]));

      expect(result.current[0].users[user].resources).toStrictEqual(
        users[user].resources
      );
      expect(result.current[0].users[user].config).toStrictEqual(
        users[user].config
      );
      expect(result.current[0].users[user].resources).not.toStrictEqual({
        [ResourceType.WOOD]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 1,
      });
    });
  });
  it.skip("Adds resources when 'got' message appears", () => {
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
  describe.skip("Spending resources works as expected", () => {
    let playerName: string;
    let stealerName: string;
    let stealer2: string;

    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      const players = Object.keys(result.current[0].users);
      [playerName, stealerName, stealer2] = shuffleArray(players);
    });
    describe.skip("Build road", () => {
      it.skip("Builds it correctly", () => {
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
      describe.skip("Review steal", () => {
        it.skip("Resolves when stealer uses stolen resource needed for purchase.", () => {
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
        it.skip("Resolves when victim uses possible stolen resource needed for purchase.", () => {
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
        it.skip("Does not resolves when stealer does not use stolen resource needed for purchase.", () => {
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
        it.skip("Does not resolves when victim not use stolen resource needed for purchase.", () => {
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
        it.skip("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
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
        it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
      });
    });
    describe.skip("Build settlement", () => {
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
        it.skip("Resolves when stealer uses stolen resource needed for purchase.", () => {
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
        it.skip("Resolves when victim uses possible stolen resource needed for purchase.", () => {
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
        it.skip("Does not resolves when stealer does not use stolen resource needed for purchase.", () => {
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
                [ResourceType.SHEEP]: 1,
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
        it.skip("Does not resolves when victim not use stolen resource needed for purchase.", () => {
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
        it.skip("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
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
                [ResourceType.WHEAT]: 1,
                [ResourceType.BRICK]: 1,
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
        it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
      });
    });
    describe.skip("Build city", () => {
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
        it.skip("Resolves when stealer uses stolen resource needed for purchase.", () => {
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
        it.skip("Resolves when victim uses possible stolen resource needed for purchase.", () => {
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
        it.skip("Does not resolve when stealer does not use stolen resource needed for purchase.", () => {
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
                [ResourceType.BRICK]: 1,
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
        it.skip("Does not resolves when victim not use stolen resource needed for purchase.", () => {
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
        it.skip("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {
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
        it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
      });
    });
  });
  describe.skip("Trading works as expected", () => {
    let offeringPlayer: string;
    let agreeingPlayer: string;
    let player3: string;

    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      const players = Object.keys(result.current[0].users);
      [offeringPlayer, agreeingPlayer, player3] = shuffleArray(players);
    });

    describe.skip("trading with bank", () => {
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

        expect(result.current[0].users[offeringPlayer].resources).toStrictEqual(
          {
            [ResourceType.WOOD]: 1,
            [ResourceType.WHEAT]: 0,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 0,
          }
        );
        expect(
          result.current[0].users[offeringPlayer].resources
        ).not.toStrictEqual(emptyResources);
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

        expect(result.current[0].users[offeringPlayer].resources).toStrictEqual(
          {
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 0,
          }
        );
        expect(
          result.current[0].users[offeringPlayer].resources
        ).not.toStrictEqual(emptyResources);
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

        expect(result.current[0].users[offeringPlayer].resources).toStrictEqual(
          {
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 0,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 1,
          }
        );
        expect(
          result.current[0].users[offeringPlayer].resources
        ).not.toStrictEqual(emptyResources);
      });
      describe("Resolves steal", () => {
        it.skip("Resolves when stealer uses stolen resource needed for bank trade.", () => {
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
        it.skip("Resolves when victim uses possible stolen resource needed for bank trade.", () => {
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
        it.skip("Does not resolve when stealer does not use stolen resource needed for bank trade.", () => {
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
                [ResourceType.BRICK]: 1,
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
        it.skip("Does not resolves when victim not use stolen resource needed for bank trade.", () => {
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
            [ResourceType.WHEAT]: 1,
            [ResourceType.STONE]: 1,
          });
        });
        it.skip("Possible stolen resources are diminished when victim bank trade with possible stolen resource", () => {
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
        it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
      });
    });
    describe.skip("trading with player", () => {
      it("trades successfully", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            offeringPlayer,
            [ResourceType.SHEEP],
            result.current[0].users[offeringPlayer].config.color
          );
        });
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            agreeingPlayer,
            [ResourceType.WHEAT],
            result.current[0].users[agreeingPlayer].config.color
          );
        });

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

        expect(result.current[0].users[offeringPlayer].resources).toStrictEqual(
          {
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 0,
          }
        );
        expect(result.current[0].users[agreeingPlayer].resources).toStrictEqual(
          {
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 0,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 1,
            [ResourceType.STONE]: 0,
          }
        );
        expect(
          result.current[0].users[agreeingPlayer].resources
        ).not.toStrictEqual(emptyResources);
      });
      describe("Resolves steal", () => {
        it.skip("Resolves when stealer uses stolen resource needed for player trade.", () => {
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
        it.skip("Resolves when victim uses possible stolen resource needed for player trade.", () => {
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
        it.skip("Does not resolve when stealer does not use stolen resource needed for player trade.", () => {
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
        it.skip("Possible stolen resources are diminished when victim trade with possible stolen resource", () => {
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
        it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
      });
    });
  });
  describe("Monopoly card steals all resources from all players", () => {
    let players: string[];
    let playerPlayingMonopoly: string;
    let stealerName: string;
    let playerName: string;
    let player3: string;
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      players = Object.keys(result.current[0].users);
      [playerName, stealerName, playerPlayingMonopoly, player3] =
        shuffleArray(players);
    });

    it("Steals all bricks", () => {
      players.forEach((player) => {
        // Add resources to each player
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            player,
            [ResourceType.BRICK, ResourceType.BRICK, ResourceType.WHEAT],
            result.current[0].users[player].config.color
          );
        });
      });

      const amountStolen = players.reduce((acc, player) => {
        if (player !== playerPlayingMonopoly) {
          return (
            acc + result.current[0].users[player].resources[ResourceType.BRICK]
          );
        }
        return acc;
      }, 0);

      expect(amountStolen).toBe(6);
      act(() =>
        monopoly(
          result.current[1],
          playerPlayingMonopoly,
          result.current[0].users[playerPlayingMonopoly].config.color,
          ResourceType.BRICK,
          amountStolen
        )
      );

      players.forEach((player) => {
        if (player !== playerPlayingMonopoly) {
          expect(result.current[0].users[player].resources).toStrictEqual({
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 0,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 0,
          });
        } else {
          expect(result.current[0].users[player].resources).toStrictEqual({
            [ResourceType.WOOD]: 0,
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 8,
            [ResourceType.SHEEP]: 0,
            [ResourceType.STONE]: 0,
          });
        }
      });
    });
    describe("Resolves steal", () => {
      it("Resolves when stealer plays monopoly", () => {
        const usersResources = {
          [playerPlayingMonopoly]: [
            ResourceType.STONE,
            ResourceType.WOOD,
            ResourceType.BRICK,
            ResourceType.WHEAT,
          ],
          [playerName]: [ResourceType.WHEAT, ResourceType.BRICK],
          [player3]: [
            ResourceType.WHEAT,
            ResourceType.WHEAT,
            ResourceType.SHEEP,
          ],
          [stealerName]: [
            ResourceType.WHEAT,
            ResourceType.WHEAT,
            ResourceType.BRICK,
            ResourceType.SHEEP,
          ],
        };

        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            usersResources,
            result.current[0].users
          )
        );
        // Unknown steal occurred
        act(() =>
          unknownSteal(
            result.current[1],
            playerName,
            playerPlayingMonopoly,
            result.current[0].users[playerPlayingMonopoly].config.color
          )
        );
        // Unknown steal occurred
        act(() =>
          unknownSteal(
            result.current[1],
            player3,
            playerPlayingMonopoly,
            result.current[0].users[playerPlayingMonopoly].config.color
          )
        );
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(2);
        // Play monopoly
        act(() => {
          monopoly(
            result.current[1],
            playerPlayingMonopoly,
            result.current[0].users[playerPlayingMonopoly].config.color,
            ResourceType.WHEAT,
            maxMonopolyGain(
              [
                ...usersResources[playerName],
                ...usersResources[stealerName],
                ...usersResources[player3],
              ],
              ResourceType.WHEAT
            )
          );
        });
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 1,
        });
        expect(
          result.current[0].users[playerPlayingMonopoly].resources
        ).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 2,
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 6,
          [ResourceType.STONE]: 1,
          [ResourceType.SHEEP]: 1,
        });
        expect(result.current[0].users[player3].resources).toStrictEqual({
          ...emptyResources,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
        });
      });
      it.skip("Resolves when victim plays monopoly", () => {
        const usersResources = {
          [playerPlayingMonopoly]: [
            ResourceType.BRICK,
            ResourceType.WOOD,
            ResourceType.BRICK,
            ResourceType.WOOD,
            ResourceType.WOOD,
          ],
          [playerName]: [
            ResourceType.WOOD,
            ResourceType.BRICK,
            ResourceType.WOOD,
            ResourceType.WOOD,
          ],
          [player3]: [ResourceType.WHEAT, ResourceType.SHEEP],
          [stealerName]: [
            ResourceType.WHEAT,
            ResourceType.WOOD,
            ResourceType.WOOD,
            ResourceType.SHEEP,
          ],
        };

        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            usersResources,
            result.current[0].users
          )
        );
        // Unknown steal occurred
        act(() =>
          unknownSteal(
            result.current[1],
            playerPlayingMonopoly,
            stealerName,
            result.current[0].users[playerPlayingMonopoly].config.color
          )
        );
        // Unknown steal occurred
        act(() =>
          unknownSteal(
            result.current[1],
            playerPlayingMonopoly,
            playerName,
            result.current[0].users[playerPlayingMonopoly].config.color
          )
        );
        // Check the theft record
        expect(result.current[0].thefts).toHaveLength(2);

        // Trade with player
        act(() => {
          monopoly(
            result.current[1],
            playerPlayingMonopoly,
            result.current[0].users[playerPlayingMonopoly].config.color,
            ResourceType.WOOD,
            maxMonopolyGain(
              [
                ...usersResources[playerName],
                ...usersResources[stealerName],
                ...usersResources[player3],
              ],
              ResourceType.WOOD
            )
          );
        });
        // Theft should be resolved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);
        // Check players resources
        expect(result.current[0].users[stealerName].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 1,
        });
        expect(
          result.current[0].users[playerPlayingMonopoly].resources
        ).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 2,
          [ResourceType.WOOD]: 8,
        });
        expect(result.current[0].users[player3].resources).toStrictEqual({
          ...emptyResources,
        });
        expect(result.current[0].users[playerName].resources).toStrictEqual({
          ...emptyResources,
        });
      });
      // it.skip("Does not resolve when stealer plays monopoly", () => {
      //   const stealerName = offeringPlayer;
      //   const playerName = agreeingPlayer;
      //   // Initialize resources and theft
      //   act(() =>
      //     givePlayersInitialResources(
      //       result.current[1],
      //       {
      //         [stealerName]: [ResourceType.WHEAT, ResourceType.STONE],
      //         [playerName]: [ResourceType.WOOD, ResourceType.BRICK],
      //         [player3]: [ResourceType.SHEEP],
      //       },
      //       result.current[0].users
      //     )
      //   );
      //   // Unknown steal occurred
      //   act(() =>
      //     unknownSteal(
      //       result.current[1],
      //       playerName,
      //       stealerName,
      //       result.current[0].users[stealerName].config.color
      //     )
      //   );
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   // Trade with player
      //   act(() => {
      //     playerTrade(
      //       result.current[1],
      //       stealerName,
      //       player3,
      //       [ResourceType.WHEAT],
      //       [ResourceType.SHEEP],
      //       result.current[0].users[playerName].config.color
      //     );
      //   });
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   expect(result.current[0].thefts).toStrictEqual([
      //     {
      //       who: {
      //         stealer: stealerName,
      //         victim: playerName,
      //       },
      //       what: {
      //         [ResourceType.WOOD]: 1,
      //         [ResourceType.BRICK]: 1,
      //       },
      //     },
      //   ]);
      //   // Check players resources
      //   expect(result.current[0].users[stealerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.SHEEP]: 1,
      //     [ResourceType.STONE]: 1,
      //   });
      //   expect(result.current[0].users[playerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WOOD]: 1,
      //     [ResourceType.BRICK]: 1,
      //   });
      //   expect(result.current[0].users[player3].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WHEAT]: 1,
      //   });
      // });
      // it.skip("Does not resolves when victim plays monopoly", () => {
      //   const stealerName = offeringPlayer;
      //   const playerName = agreeingPlayer;

      //   // Initialize resources and theft
      //   act(() =>
      //     givePlayersInitialResources(
      //       result.current[1],
      //       {
      //         [stealerName]: [ResourceType.STONE, ResourceType.WHEAT],
      //         [playerName]: [
      //           ResourceType.SHEEP,
      //           ResourceType.WOOD,
      //           ResourceType.WOOD,
      //         ],
      //       },
      //       result.current[0].users
      //     )
      //   );
      //   // Unknown steal occurred
      //   act(() =>
      //     unknownSteal(
      //       result.current[1],
      //       playerName,
      //       stealerName,
      //       result.current[0].users[stealerName].config.color
      //     )
      //   );
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   // Trade with player
      //   act(() => {
      //     playerTrade(
      //       result.current[1],
      //       playerName,
      //       stealerName,
      //       [ResourceType.WOOD],
      //       [ResourceType.WHEAT],
      //       result.current[0].users[playerName].config.color
      //     );
      //   });
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   expect(result.current[0].thefts).toStrictEqual([
      //     {
      //       who: {
      //         stealer: stealerName,
      //         victim: playerName,
      //       },
      //       what: {
      //         [ResourceType.SHEEP]: 1,
      //         [ResourceType.WOOD]: 1,
      //       },
      //     },
      //   ]);
      //   // Check players resources
      //   expect(result.current[0].users[playerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WOOD]: 1,
      //     [ResourceType.SHEEP]: 1,
      //     [ResourceType.WHEAT]: 1,
      //   });
      //   expect(result.current[0].users[stealerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WOOD]: 1,
      //     [ResourceType.STONE]: 1,
      //   });
      // });
      // it.skip("Possible stolen resources are diminished when victim plays monopoly", () => {
      //   const stealerName = offeringPlayer;
      //   const playerName = agreeingPlayer;
      //   // Initialize resources and theft
      //   act(() =>
      //     givePlayersInitialResources(
      //       result.current[1],
      //       {
      //         [stealerName]: [ResourceType.SHEEP, ResourceType.STONE],
      //         [playerName]: [
      //           ResourceType.WOOD,
      //           ResourceType.WOOD,
      //           ResourceType.BRICK,
      //           ResourceType.WHEAT,
      //           ResourceType.STONE,
      //           ResourceType.SHEEP,
      //         ],
      //       },
      //       result.current[0].users
      //     )
      //   );
      //   // Unknown steal occurred
      //   act(() =>
      //     unknownSteal(
      //       result.current[1],
      //       playerName,
      //       stealerName,
      //       result.current[0].users[stealerName].config.color
      //     )
      //   );
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   // Trade with player
      //   act(() => {
      //     playerTrade(
      //       result.current[1],
      //       playerName,
      //       stealerName,
      //       [
      //         ResourceType.BRICK,
      //         ResourceType.STONE,
      //         ResourceType.WOOD,
      //         ResourceType.WOOD,
      //       ],
      //       [ResourceType.SHEEP],
      //       result.current[0].users[playerName].config.color
      //     );
      //   });
      //   // Check the theft record
      //   expect(result.current[0].thefts).toHaveLength(1);
      //   expect(result.current[0].thefts).toStrictEqual([
      //     {
      //       who: {
      //         stealer: stealerName,
      //         victim: playerName,
      //       },
      //       what: {
      //         [ResourceType.WHEAT]: 1,
      //         [ResourceType.SHEEP]: 1,
      //       },
      //     },
      //   ]);

      //   // Check players resources
      //   expect(result.current[0].users[playerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WHEAT]: 1,
      //     [ResourceType.SHEEP]: 2,
      //   });
      //   expect(result.current[0].users[stealerName].resources).toStrictEqual({
      //     ...emptyResources,
      //     [ResourceType.WOOD]: 2,
      //     [ResourceType.STONE]: 2,
      //     [ResourceType.BRICK]: 1,
      //   });
      // });
      // it.skip("Checks the available resources in play to resolve theft. (Double steal)", () => {});
    });
  });
  it.skip("Successfully executes 'Year of Plenty", () => {
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
  describe.skip("Discard cards", () => {
    let playerDiscarding: string;
    let stealerName: string;
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));
      // Picking a random player
      const players = Object.keys(result.current[0].users);
      [playerDiscarding, stealerName] = shuffleArray(players);
    });

    it("SuccessFully discards cards", () => {
      const resources = [
        ResourceType.BRICK,
        ResourceType.WOOD,
        ResourceType.WHEAT,
        ResourceType.SHEEP,
      ];

      // Add resources to each player
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          playerDiscarding,
          resources,
          result.current[0].users[playerDiscarding].config.color
        );
      });

      act(() =>
        discardCards(
          result.current[1],
          playerDiscarding,
          result.current[0].users[playerDiscarding].config.color,
          resources
        )
      );
      expect(result.current[0].users[playerDiscarding].resources).toStrictEqual(
        emptyResources
      );
    });
    describe("Resolves steal", () => {});
  });
  describe.skip("Stole from or by you", () => {
    let player: string;
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));
      // Picking a random player
      const players = Object.keys(result.current[0].users);
      const shuffledPlayers = shuffleArray(players);
      player =
        shuffledPlayers[0] === keywords.userName
          ? shuffledPlayers[1]
          : shuffledPlayers[0];
    });
    it("You steal from others", () => {
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          player,
          [ResourceType.BRICK, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[player].config.color
        );
      });
      act(() =>
        stoleFromOrByYou(
          result.current[1],
          player,
          result.current[0].users[player].config.color,
          ResourceType.WHEAT,
          true
        )
      );
      expect(
        result.current[0].users[keywords.userName].resources
      ).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 0,
      });
      // Victim
      expect(result.current[0].users[player].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 0,
      });
    });
    it("Other player steals from you", () => {
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          keywords.userName,
          [ResourceType.SHEEP, ResourceType.STONE, ResourceType.WHEAT],
          result.current[0].users[keywords.userName].config.color
        );
      });
      act(() =>
        stoleFromOrByYou(
          result.current[1],
          player,
          result.current[0].users[player].config.color,
          ResourceType.SHEEP
        )
      );
      expect(result.current[0].users[player].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });
      // Victim
      expect(
        result.current[0].users[keywords.userName].resources
      ).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 1,
      });
    });
    describe("Resolves steal", () => {});
  });
  describe.skip("Unknown steals", () => {
    let victim: string;
    let stealer: string;
    let victimOfVictim: string;
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));
      // Picking a random player
      const players = Object.keys(result.current[0].users).filter(
        (player) => player !== keywords.userName
      );
      [victim, stealer, victimOfVictim] = shuffleArray(players);
    });

    it("unknown resource theft happens once", () => {
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          victim,
          [ResourceType.BRICK, ResourceType.WOOD, ResourceType.STONE],
          result.current[0].users[victim].config.color
        );
      });
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].config.color
        );
      });

      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );
      expect(result.current[0].users[victim].resources).toStrictEqual({
        [ResourceType.WOOD]: 1,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer,
            victim,
          },
          what: {
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
            [ResourceType.STONE]: 1,
          },
        },
      ]);
    });
    it("unknown resource theft happens twice", () => {
      // Victim
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          victim,
          [
            ResourceType.BRICK,
            ResourceType.WOOD,
            ResourceType.WOOD,
            ResourceType.SHEEP,
            ResourceType.WHEAT,
            ResourceType.STONE,
          ],
          result.current[0].users[victim].config.color
        );
      });
      // Stealer
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].config.color
        );
      });
      // Victim of victim
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          victimOfVictim,
          [ResourceType.SHEEP, ResourceType.WHEAT],
          result.current[0].users[victimOfVictim].config.color
        );
      });

      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );
      act(() =>
        unknownSteal(
          result.current[1],
          victimOfVictim,
          victim,
          result.current[0].users[victim].config.color
        )
      );
      // Victim
      expect(result.current[0].users[victim].resources).toStrictEqual({
        [ResourceType.WOOD]: 2,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });
      // Stealer
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });
      // Victim of victim
      expect(result.current[0].users[victimOfVictim].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });
      expect(result.current[0].thefts).toHaveLength(2);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer,
            victim,
          },
          what: {
            [ResourceType.WOOD]: 1,
            [ResourceType.BRICK]: 1,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
          },
        },
        {
          who: {
            stealer: victim,
            victim: victimOfVictim,
          },
          what: {
            [ResourceType.WHEAT]: 1,
            [ResourceType.SHEEP]: 1,
          },
        },
      ]);
    });
    it("victim has only one possible resource", () => {
      // Victim
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          victim,
          [ResourceType.BRICK],
          result.current[0].users[victim].config.color
        );
      });
      // Stealer
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].config.color
        );
      });

      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );
      // Victim
      expect(result.current[0].users[victim].resources).toStrictEqual(
        emptyResources
      );
      // Stealer
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
    });
    it("victim has only no resources to be stolen", () => {
      // Stealer
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [
            ResourceType.STONE,
            ResourceType.BRICK,
            ResourceType.SHEEP,
            ResourceType.SHEEP,
          ],
          result.current[0].users[stealer].config.color
        );
      });

      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );
      // Victim
      expect(result.current[0].users[victim].resources).toStrictEqual(
        emptyResources
      );
      // Stealer
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 2,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
    });
  });
});
