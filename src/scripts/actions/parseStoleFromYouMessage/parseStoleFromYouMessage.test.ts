import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";
import { shuffleArray, emptyResources } from "../../../tests/utils";
import { GameData, ResourceType } from "../../../types";
import {
  initiateTestingPlayers,
  giveResourcesToPlayer,
  stoleFromOrByYou,
  givePlayersInitialResources,
  unknownSteal,
} from "../../../utils/helpers/forTest/testing.helpers";
import keywords from "../../../utils/keywords";

describe("Stole from or by you", () => {
  const youPlayer = keywords.userName;
  let player: string;
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
    const shuffledPlayers = shuffleArray(players);
    [player, stealerName] = shuffledPlayers.filter(
      (player) => player !== keywords.userName
    );
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
    expect(result.current[0].users[keywords.userName].resources).toStrictEqual({
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
    expect(result.current[0].users[keywords.userName].resources).toStrictEqual({
      [ResourceType.WOOD]: 0,
      [ResourceType.WHEAT]: 1,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 1,
    });
  });
  describe("Resolves steal", () => {
    it("Resolves when you steal a resource the stealer did not have before.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.STONE],
            [youPlayer]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
              ResourceType.SHEEP,
            ],
            [player]: [ResourceType.WHEAT, ResourceType.BRICK],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          player,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // You perform a steal
      act(() => {
        stoleFromOrByYou(
          result.current[1],
          stealerName,
          result.current[0].users[youPlayer].config.color,
          ResourceType.WHEAT,
          true
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
      expect(result.current[0].users[player].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[youPlayer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 2,
      });
    });
    it("Resolves when you steal a resource from a victim with two resource types.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.STONE],
            [youPlayer]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
              ResourceType.SHEEP,
            ],
            [player]: [ResourceType.WHEAT, ResourceType.BRICK],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          player,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // You perform a steal
      act(() => {
        stoleFromOrByYou(
          result.current[1],
          player,
          result.current[0].users[youPlayer].config.color,
          ResourceType.BRICK,
          true
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.STONE]: 1,
        [ResourceType.WHEAT]: 1,
      });
      expect(result.current[0].users[player].resources).toStrictEqual({
        ...emptyResources,
      });
      expect(result.current[0].users[youPlayer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
    });
    it("Does not resolve when you steal a resource the stealer did have before.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.STONE],
            [youPlayer]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
              ResourceType.SHEEP,
            ],
            [player]: [ResourceType.WHEAT, ResourceType.BRICK],
          },
          result.current[0].users
        )
      );
      // Unknown steal occurred
      act(() =>
        unknownSteal(
          result.current[1],
          player,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // You perform a steal
      act(() => {
        stoleFromOrByYou(
          result.current[1],
          stealerName,
          result.current[0].users[youPlayer].config.color,
          ResourceType.STONE,
          true
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: player,
          },
          what: {
            [ResourceType.WHEAT]: 1,
            [ResourceType.BRICK]: 1,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
      });
      expect(result.current[0].users[player].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
      });
      expect(result.current[0].users[youPlayer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.STONE]: 1,
      });
    });
    it("Reduce steal possibilities when you steal a resource from a victim with two or more resource types.", () => {
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealerName]: [ResourceType.STONE],
            [youPlayer]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
              ResourceType.SHEEP,
            ],
            [player]: [
              ResourceType.WHEAT,
              ResourceType.BRICK,
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
          player,
          stealerName,
          result.current[0].users[stealerName].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // You perform a steal
      act(() => {
        stoleFromOrByYou(
          result.current[1],
          player,
          result.current[0].users[youPlayer].config.color,
          ResourceType.BRICK,
          true
        );
      });
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      expect(result.current[0].thefts).toStrictEqual([
        {
          who: {
            stealer: stealerName,
            victim: player,
          },
          what: {
            [ResourceType.WHEAT]: 1,
            [ResourceType.WOOD]: 1,
            [ResourceType.SHEEP]: 1,
          },
        },
      ]);
      // Check players resources
      expect(result.current[0].users[stealerName].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[player].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WHEAT]: 1,
        [ResourceType.WOOD]: 1,
        [ResourceType.SHEEP]: 1,
      });
      expect(result.current[0].users[youPlayer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WHEAT]: 1,
      });
    });
  });
});
