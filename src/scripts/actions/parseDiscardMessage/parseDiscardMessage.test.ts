import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";
import { shuffleArray, emptyResources } from "../../../tests/utils";
import { GameData, ResourceType } from "../../../types";
import {
  initiateTestingPlayers,
  giveResourcesToPlayer,
  discardCards,
  givePlayersInitialResources,
  unknownSteal,
} from "../../../utils/helpers/forTest/testing.helpers";

describe("Discard cards", () => {
  let playerDiscarding: string;
  let stealerName: string;
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

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
  describe("Resolves steal", () => {
    it("Resolves when stealer discards stolen resource needed.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [
              ResourceType.STONE,
              ResourceType.STONE,
              ResourceType.STONE,
              ResourceType.WOOD,
              ResourceType.BRICK,
            ],
            [playerDiscarding]: [
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
          playerDiscarding,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Discard cards
      act(() => {
        discardCards(
          result.current[1],
          stealerName,
          result.current[0].users[stealerName].config.color,
          [
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.WHEAT,
          ]
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[playerDiscarding].resources).toStrictEqual(
        {
          ...emptyResources,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 1,
        }
      );
    });
    it("Resolves when victim discards stole resource needed.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.WOOD, ResourceType.BRICK],
            [playerDiscarding]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
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
          playerDiscarding,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Discard Cards
      act(() => {
        discardCards(
          result.current[1],
          playerDiscarding,
          result.current[0].users[stealerName].config.color,
          [
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.WHEAT,
          ]
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 2,
      });
      expect(result.current[0].users[playerDiscarding].resources).toStrictEqual(
        {
          ...emptyResources,
        }
      );
    });
    it("Possible stolen resources are diminished when victim discards possible stolen resource", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.WOOD, ResourceType.BRICK],
            [playerDiscarding]: [
              ResourceType.WHEAT,
              ResourceType.WOOD,
              ResourceType.SHEEP,
              ResourceType.BRICK,
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
          playerDiscarding,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Discard Cards
      act(() => {
        discardCards(
          result.current[1],
          playerDiscarding,
          result.current[0].users[stealerName].config.color,
          [
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.STONE,
            ResourceType.WHEAT,
          ]
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: playerDiscarding,
          },
          what: {
            [ResourceType.SHEEP]: 1,
            [ResourceType.BRICK]: 1,
            [ResourceType.WOOD]: 1,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[playerDiscarding].resources).toStrictEqual(
        {
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.WOOD]: 1,
        }
      );
    });
  });
});
