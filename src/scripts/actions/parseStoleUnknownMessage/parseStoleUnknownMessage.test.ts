import { renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { Action, reducer } from "../../../reducer";

import { GameData, ResourceType } from "../../../types";
import { emptyResources } from "../../../utils/data";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";
import { giveResourcesToPlayer } from "../../../utils/helpers/simulator/giveResourcesToPlayer";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";

import keywords from "../../../utils/keywords";

describe("Unknown steals", () => {
  let victim: string;
  let stealer: string;
  let victimOfVictim: string;
  let result: RenderResult<[GameData, React.Dispatch<Action>]>;

  beforeEach(() => {
    // Reducer data setup
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
    const players = Object.keys(result.current[0].users).filter(
      (player) => player !== result.current[0].username
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
          [ResourceType.WOOD]: 2,
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
