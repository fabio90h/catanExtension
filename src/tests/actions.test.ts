import { Action, reducer } from "../reducer";
import React from "react";
import {
  parseBankTrade,
  parseGot,
  recognizeUsers,
} from "../scripts/actionParser";
import keywords from "../utils/keywords";
import {
  GameData,
  PurchaseType,
  ResourceType,
  UserConfig,
  UserResources,
} from "../types";
import { renderHook, RenderResult } from "@testing-library/react-hooks";
import { act } from "react-dom/test-utils";
import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
  initiateTestingPlayers,
  getRandomResources,
  getRandomArbitrary,
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
    act(() => initiateTestingPlayers(result.current[1]));

    const players = Object.keys(result.current[0].users);
    const playerIndex = getRandomArbitrary(0, players.length);

    const playerName = players[playerIndex];

    const receivingPlayerConfig = {
      ...result.current[0].users[playerName].config,
    };
    const receivingPlayerResources = {
      ...result.current[0].users[playerName].resources,
    };

    const node = createDivElement(
      receivingPlayerConfig.color,
      playerName,
      keywords.receivedResourcesSnippet
    );

    const randomResources = getRandomResources();
    randomResources.forEach((resource) => {
      createChildImgElement(node, resource);
      receivingPlayerResources[resource] += 1; //green
    });

    act(() => {
      const pass = parseGot(node as HTMLElement, result.current[1]);
      if (pass === undefined) return pass;
    });

    expect(result.current[0].users[playerName].resources).toStrictEqual(
      receivingPlayerResources
    );

    expect(result.current[0].users[playerName].resources).not.toStrictEqual(
      emptyResources
    );
  });
  describe("Spending resources works as expected", () => {
    let playerName: string;
    let playerConfig: UserConfig;
    let playerResources: UserResources;

    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      const players = Object.keys(result.current[0].users);
      const playerIndex = getRandomArbitrary(0, players.length);
      playerName = players[playerIndex];

      playerConfig = {
        ...result.current[0].users[playerName].config,
      };
      //TODO: These are prob unnecessary
      playerResources = {
        ...result.current[0].users[playerName].resources,
      };
    });
    describe("Build road", () => {
      it("Builds it correctly", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          playerResources = giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase[PurchaseType.ROAD],
            playerResources,
            playerConfig.color
          );
        });
        // Purchases a road
        act(() => {
          playerResources = playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.ROAD,
            playerResources,
            playerConfig.color
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
        const stealerName = "Alex";
        it.skip("Resolves when stealer uses stolen resource needed for purchase.", () => {
          // Add resources stealerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              stealerName,
              [ResourceType.BRICK, ResourceType.WHEAT],
              result.current[0].users[stealerName].resources,
              result.current[0].users[stealerName].config.color
            );
          });
          // Add resources playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              [ResourceType.WOOD, ResourceType.SHEEP],
              result.current[0].users[playerName].resources,
              result.current[0].users[playerName].config.color
            );
          });
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[playerName].config.color
            )
          );
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
                [ResourceType.SHEEP]: 1,
              },
            },
          ]);
          // Purchases a road
          act(() => {
            playerMakesPurchase(
              result.current[1],
              stealerName,
              PurchaseType.ROAD,
              result.current[0].users[stealerName].resources,
              result.current[0].users[stealerName].config.color
            );
          });
          // Check the theft record
          expect(result.current[0].thefts).toHaveLength(0);
          expect(result.current[0].thefts).toStrictEqual([]);

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
            [ResourceType.STONE]: 0,
          });
        });
        it.skip("Resolves when victim uses possible stolen resource needed for purchase.", () => {
          // Add resources stealerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              stealerName,
              [ResourceType.BRICK, ResourceType.WHEAT],
              result.current[0].users[stealerName].resources,
              result.current[0].users[stealerName].config.color
            );
          });
          // Add resources playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              [ResourceType.WOOD, ResourceType.BRICK, ResourceType.SHEEP],
              result.current[0].users[playerName].resources,
              result.current[0].users[playerName].config.color
            );
          });
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[playerName].config.color
            )
          );
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
                [ResourceType.SHEEP]: 1,
              },
            },
          ]);
          // Purchases a road
          act(() => {
            playerMakesPurchase(
              result.current[1],
              playerName,
              PurchaseType.ROAD,
              result.current[0].users[stealerName].resources,
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
          // Add resources stealerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              stealerName,
              [ResourceType.WOOD, ResourceType.BRICK, ResourceType.WHEAT],
              result.current[0].users[stealerName].resources,
              result.current[0].users[stealerName].config.color
            );
          });
          // Add resources playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              [ResourceType.STONE, ResourceType.SHEEP],
              result.current[0].users[playerName].resources,
              result.current[0].users[playerName].config.color
            );
          });
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[playerName].config.color
            )
          );
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
          // Purchases a road
          act(() => {
            playerMakesPurchase(
              result.current[1],
              stealerName,
              PurchaseType.ROAD,
              result.current[0].users[stealerName].resources,
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
          // Add resources stealerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              [ResourceType.SHEEP, ResourceType.WHEAT],
              result.current[0].users[stealerName].resources,
              result.current[0].users[stealerName].config.color
            );
          });
          // Add resources playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              stealerName,
              [ResourceType.STONE, ResourceType.SHEEP],
              result.current[0].users[playerName].resources,
              result.current[0].users[playerName].config.color
            );
          });
          // Unknown steal occurred
          act(() =>
            unknownSteal(
              result.current[1],
              playerName,
              stealerName,
              result.current[0].users[playerName].config.color
            )
          );
          // Give road resources to playerName
          act(() => {
            giveResourcesToPlayer(
              result.current[1],
              playerName,
              testData.purchase.ROAD,
              result.current[0].users[stealerName].resources,
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
              result.current[0].users[playerName].resources,
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
        it("Possible stolen resources are diminished when victim purchases with possible stolen resource", () => {});
        it("Checks the available resources in play to resolve theft.", () => {});
      });
    });
    describe.skip("Build settlement", () => {
      it("Builds it correctly", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          playerResources = giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase[PurchaseType.SETTLEMENT],
            playerResources,
            playerConfig.color
          );
        });
        // Purchases a settlement
        act(() => {
          playerResources = playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.SETTLEMENT,
            playerResources,
            playerConfig.color
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
    describe.skip("Build city", () => {
      it("Builds it correctly", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          playerResources = giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase[PurchaseType.CITY],
            playerResources,
            playerConfig.color
          );
        });
        // Purchases a city
        act(() => {
          playerResources = playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.CITY,
            playerResources,
            playerConfig.color
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
    describe.skip("Buys development card", () => {
      it("Buys it correctly", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          playerResources = giveResourcesToPlayer(
            result.current[1],
            playerName,
            testData.purchase[PurchaseType.DEVELOPMENT],
            playerResources,
            playerConfig.color
          );
        });
        // Purchases a development card
        act(() => {
          playerResources = playerMakesPurchase(
            result.current[1],
            playerName,
            PurchaseType.DEVELOPMENT,
            playerResources,
            playerConfig.color
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
    it.skip("Not enough resources will result in error", () => {
      // Dont give any resources to player

      // Purchases a development card
      act(() => {
        playerResources = playerMakesPurchase(
          result.current[1],
          playerName,
          PurchaseType.DEVELOPMENT,
          playerResources,
          playerConfig.color
        );
      });
      // All resources will be zero since the dispatch is not allowed to execute.
      expect(result.current[0].users[playerName].resources).toStrictEqual(
        emptyResources
      );
    });
  });
  describe.skip("Trading works as expected", () => {
    let offeringPlayer: string;
    let agreeingPlayer: string;

    let offeringPlayerConfig: UserConfig;
    let offeringPlayerResources: UserResources;

    let agreeingPlayerConfig: UserConfig;
    let agreeingPlayerResources: UserResources;

    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      const players = Object.keys(result.current[0].users);
      const playerRandom = shuffleArray(players);
      offeringPlayer = playerRandom[0];
      agreeingPlayer = playerRandom[1];

      offeringPlayerConfig = {
        ...result.current[0].users[offeringPlayer].config,
      };
      offeringPlayerResources = {
        ...result.current[0].users[offeringPlayer].resources,
      };

      agreeingPlayerConfig = {
        ...result.current[0].users[offeringPlayer].config,
      };
      agreeingPlayerResources = {
        ...result.current[0].users[offeringPlayer].resources,
      };
    });

    describe.skip("trading with bank", () => {
      it("4 to 1 trade", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          offeringPlayerResources = giveResourcesToPlayer(
            result.current[1],
            offeringPlayer,
            [
              ResourceType.BRICK,
              ResourceType.BRICK,
              ResourceType.BRICK,
              ResourceType.BRICK,
            ],
            offeringPlayerResources,
            offeringPlayerConfig.color
          );
        });

        // Purchases a road
        act(() => {
          offeringPlayerResources = bankTrade(
            result.current[1],
            offeringPlayer,
            [
              ResourceType.BRICK,
              ResourceType.BRICK,
              ResourceType.BRICK,
              ResourceType.BRICK,
            ],
            [ResourceType.WOOD],
            offeringPlayerResources,
            offeringPlayerConfig.color
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
          offeringPlayerResources = giveResourcesToPlayer(
            result.current[1],
            offeringPlayer,
            [ResourceType.BRICK, ResourceType.BRICK, ResourceType.BRICK],
            offeringPlayerResources,
            offeringPlayerConfig.color
          );
        });

        // Purchases a road
        act(() => {
          offeringPlayerResources = bankTrade(
            result.current[1],
            offeringPlayer,
            [ResourceType.BRICK, ResourceType.BRICK, ResourceType.BRICK],
            [ResourceType.WHEAT],
            offeringPlayerResources,
            offeringPlayerConfig.color
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
          offeringPlayerResources = giveResourcesToPlayer(
            result.current[1],
            offeringPlayer,
            [ResourceType.SHEEP, ResourceType.SHEEP],
            offeringPlayerResources,
            offeringPlayerConfig.color
          );
        });

        // Purchases a road
        act(() => {
          offeringPlayerResources = bankTrade(
            result.current[1],
            offeringPlayer,
            [ResourceType.SHEEP, ResourceType.SHEEP],
            [ResourceType.STONE],
            offeringPlayerResources,
            offeringPlayerConfig.color
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
      describe("Resolves steal", () => {});
    });
    describe.skip("trading with player", () => {
      it("trades successfully", () => {
        // Add the resources to make sure the user has the necessary resources to buy
        act(() => {
          offeringPlayerResources = giveResourcesToPlayer(
            result.current[1],
            offeringPlayer,
            [ResourceType.SHEEP],
            offeringPlayerResources,
            offeringPlayerConfig.color
          );
        });
        act(() => {
          agreeingPlayerResources = giveResourcesToPlayer(
            result.current[1],
            agreeingPlayer,
            [ResourceType.WHEAT],
            agreeingPlayerResources,
            agreeingPlayerConfig.color
          );
        });

        act(() => {
          playerTrade(
            result.current[1],
            offeringPlayer,
            agreeingPlayer,
            [ResourceType.SHEEP],
            [ResourceType.WHEAT],
            offeringPlayerConfig.color
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
      describe("Resolves steal", () => {});
    });
  });
  describe.skip("Monopoly card steals all resources from all players", () => {
    let players: string[];
    let playerPlayingMonopoly: string;
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));

      // Picking a random player
      players = Object.keys(result.current[0].users);
      playerPlayingMonopoly = shuffleArray(players)[0];
    });

    it("Steals all bricks", () => {
      players.forEach((player) => {
        // Add resources to each player
        act(() => {
          giveResourcesToPlayer(
            result.current[1],
            player,
            [ResourceType.BRICK, ResourceType.BRICK, ResourceType.WHEAT],
            result.current[0].users[player].resources,
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
    describe("Resolves steal", () => {});
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
        result.current[0].users[playerPlayingYearOfPlenty].resources,
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
    beforeEach(() => {
      // Creates the players and its initial resources
      act(() => initiateTestingPlayers(result.current[1], true));
      // Picking a random player
      const players = Object.keys(result.current[0].users);
      playerDiscarding = shuffleArray(players)[0];
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
          result.current[0].users[playerDiscarding].resources,
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
          result.current[0].users[player].resources,
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
          result.current[0].users[keywords.userName].resources,
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
          result.current[0].users[victim].resources,
          result.current[0].users[victim].config.color
        );
      });
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].resources,
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
          result.current[0].users[victim].resources,
          result.current[0].users[victim].config.color
        );
      });
      // Stealer
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].resources,
          result.current[0].users[stealer].config.color
        );
      });
      // Victim of victim
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          victimOfVictim,
          [ResourceType.SHEEP, ResourceType.WHEAT],
          result.current[0].users[victimOfVictim].resources,
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
          result.current[0].users[victim].resources,
          result.current[0].users[victim].config.color
        );
      });
      // Stealer
      act(() => {
        giveResourcesToPlayer(
          result.current[1],
          stealer,
          [ResourceType.SHEEP, ResourceType.BRICK, ResourceType.WHEAT],
          result.current[0].users[stealer].resources,
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
          result.current[0].users[stealer].resources,
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
