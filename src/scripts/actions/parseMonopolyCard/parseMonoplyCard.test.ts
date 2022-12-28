import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";

import { GameData, ResourceType } from "../../../types";
import { emptyResources } from "../../../utils/data";
import { countTotalTypeInArray } from "../../../utils/helpers/general/countTotalTypeInArray/countTotalTypeInArray.general";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";
import { givePlayersInitialResources } from "../../../utils/helpers/simulator/givePlayersInitialResources";
import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { monopoly } from "../../../utils/helpers/simulator/monopoly";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";

describe("Monopoly card steals all resources from all players", () => {
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  let players: string[];
  let playerPlayingMonopoly: string;
  let stealerName: string;
  let playerName: string;
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
        // eslint-disable-next-line jest/no-conditional-expect
        expect(result.current[0].users[player].resources).toStrictEqual({
          [ResourceType.WOOD]: 0,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
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
    it("Resolves when stealer steals two non-monopoly resources from different players and then plays monopoly.", () => {
      const usersResources = {
        [playerPlayingMonopoly]: [
          ResourceType.STONE,
          ResourceType.WOOD,
          ResourceType.BRICK,
          ResourceType.WHEAT,
        ],
        [playerName]: [ResourceType.WHEAT, ResourceType.BRICK],
        [player3]: [ResourceType.WHEAT, ResourceType.WHEAT, ResourceType.SHEEP],
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
          countTotalTypeInArray<ResourceType>(
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
    it("Resolves when stealer steals two monopoly resources from different players and then plays monopoly.", () => {
      const usersResources = {
        [playerPlayingMonopoly]: [
          ResourceType.STONE,
          ResourceType.WOOD,
          ResourceType.BRICK,
          ResourceType.WHEAT,
        ],
        [playerName]: [ResourceType.WHEAT, ResourceType.BRICK],
        [player3]: [ResourceType.WHEAT, ResourceType.SHEEP, ResourceType.STONE],
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
          countTotalTypeInArray<ResourceType>(
            [
              ...usersResources[playerName],
              ...usersResources[stealerName],
              ...usersResources[player3],
            ],
            ResourceType.WHEAT
          ) - 2 //Hardcoded 2 here because we want to say that the unknown stolen resource was the WHEAT
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
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 5,
        [ResourceType.STONE]: 1,
        [ResourceType.WOOD]: 1,
      });
      expect(result.current[0].users[player3].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves when victim (2x monopoly resource stolen) plays monopoly", () => {
      const usersResources = {
        [playerPlayingMonopoly]: [
          //Victim
          ResourceType.WHEAT,
          ResourceType.STONE,
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

      // Play monopoly
      act(() => {
        monopoly(
          result.current[1],
          playerPlayingMonopoly,
          result.current[0].users[playerPlayingMonopoly].config.color,
          ResourceType.WOOD,
          countTotalTypeInArray<ResourceType>(
            [
              ...usersResources[playerName],
              ...usersResources[stealerName],
              ...usersResources[player3],
            ],
            ResourceType.WOOD
          ) + 2
        );
      });
      // Theft should be resolved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(
        result.current[0].users[playerPlayingMonopoly].resources
      ).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
        [ResourceType.STONE]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.WOOD]: 7,
      });
      expect(result.current[0].users[player3].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves when victim (2x non-monopoly resource stolen) plays monopoly", () => {
      const usersResources = {
        [playerPlayingMonopoly]: [
          //Victim
          ResourceType.BRICK,
          ResourceType.BRICK,
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
          player3,
          result.current[0].users[player3].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(2);

      // Playing monopoly
      act(() => {
        monopoly(
          result.current[1],
          playerPlayingMonopoly,
          result.current[0].users[playerPlayingMonopoly].config.color,
          ResourceType.WOOD,
          countTotalTypeInArray<ResourceType>(
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
        [ResourceType.WHEAT]: 1,
      });
      expect(
        result.current[0].users[playerPlayingMonopoly].resources
      ).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 6,
      });
      expect(result.current[0].users[player3].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Reduces theft resources possibilites when victim (1x non-monopoly resource stolen) plays monopoly", () => {
      const usersResources = {
        [playerPlayingMonopoly]: [
          //Victim
          ResourceType.BRICK,
          ResourceType.WOOD,
          ResourceType.STONE,
          ResourceType.WHEAT,
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
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);

      // Trade with player
      act(() => {
        monopoly(
          result.current[1],
          playerPlayingMonopoly,
          result.current[0].users[playerPlayingMonopoly].config.color,
          ResourceType.WOOD,
          countTotalTypeInArray<ResourceType>(
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
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          what: {
            [ResourceType.BRICK]: 1,
            [ResourceType.STONE]: 1,
            [ResourceType.WHEAT]: 1,
          },
          who: { stealer: stealerName, victim: playerPlayingMonopoly },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 0,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(
        result.current[0].users[playerPlayingMonopoly].resources
      ).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
        [ResourceType.STONE]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.WOOD]: 6,
      });
      expect(result.current[0].users[player3].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(result.current[0].users[playerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
    });
  });
});
