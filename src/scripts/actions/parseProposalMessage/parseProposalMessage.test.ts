import { act, renderHook, RenderResult } from "@testing-library/react-hooks";
import React from "react";
import { Action, reducer } from "../../../reducer";

import { GameData, PurchaseType, ResourceType } from "../../../types";
import { emptyResources } from "../../../utils/data";
import { shuffleArray } from "../../../utils/helpers/general/shuffleArray/shuffleArray.general";
import { givePlayersInitialResources } from "../../../utils/helpers/simulator/givePlayersInitialResources";
import { initiateTestingPlayers } from "../../../utils/helpers/simulator/initiateTestingPlayers";
import { offerProposal } from "../../../utils/helpers/simulator/offerProposal";
import { playerMakesPurchase } from "../../../utils/helpers/simulator/playerMakesPurchase";
import { unknownSteal } from "../../../utils/helpers/simulator/unknownSteal";

import keywords from "../../../utils/keywords";

describe("Resolve unknown theft from proposal message", () => {
  let victim: string;
  let stealer: string;
  let stealer2: string;

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

    // Creates the players with empty resources
    act(() => initiateTestingPlayers(result.current[1], true));

    // Picking a random player
    const players = Object.keys(result.current[0].users).filter(
      (player) => player !== result.current[0].username
    );

    // Define the players' role for this test
    [victim, stealer, stealer2] = shuffleArray(players);
  });
  describe("Victim gets single/double stolen from the same stealer", () => {
    it("Resolves single theft when victim offers", () => {
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealer]: [
              ResourceType.SHEEP,
              ResourceType.BRICK,
              ResourceType.WHEAT,
            ],
            [victim]: [
              ResourceType.BRICK,
              ResourceType.WOOD,
              ResourceType.STONE,
            ],
          },
          result.current[0].users
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // Check that a unknown that was registered
      expect(result.current[0].thefts).toHaveLength(1);

      // Check that resources will stay the same since the steal is unknown
      expect(result.current[0].users[victim].resources).toStrictEqual({
        [ResourceType.WOOD]: 1,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 1,
      });

      // victim offers a resource that had the possibility of being stolen
      act(() =>
        offerProposal(
          result.current[1],
          victim,
          [ResourceType.BRICK, ResourceType.WOOD],
          [ResourceType.STONE, ResourceType.STONE],
          result.current[0].users[victim].config.color
        )
      );

      // expect the unknown steal to be solved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);

      // Check players resources
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[victim].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves single theft when stealer offers", () => {
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealer]: [
              ResourceType.SHEEP,
              ResourceType.BRICK,
              ResourceType.WHEAT,
            ],
            [victim]: [
              ResourceType.BRICK,
              ResourceType.WOOD,
              ResourceType.STONE,
            ],
          },
          result.current[0].users
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // Check that a unknown that was registered
      expect(result.current[0].thefts).toHaveLength(1);

      // Check that resources will stay the same since the steal is unknown
      expect(result.current[0].users[victim].resources).toStrictEqual({
        [ResourceType.WOOD]: 1,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 1,
      });

      // stealer offers a resource that had the possibility of being stolen
      act(() =>
        offerProposal(
          result.current[1],
          stealer,
          [ResourceType.BRICK, ResourceType.WOOD],
          [ResourceType.STONE, ResourceType.STONE],
          result.current[0].users[stealer].config.color
        )
      );

      // expect the unknown steal to be solved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);

      // Check players resources
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.WOOD]: 1,
      });
      expect(result.current[0].users[victim].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.STONE]: 1,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves double thefts when victim offers", () => {
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealer]: [
              ResourceType.SHEEP,
              ResourceType.BRICK,
              ResourceType.WHEAT,
            ],
            [victim]: [
              ResourceType.BRICK,
              ResourceType.WOOD,
              ResourceType.STONE,
              ResourceType.SHEEP,
            ],
          },
          result.current[0].users
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // Check that a unknown that was registered
      expect(result.current[0].thefts).toHaveLength(2);

      // Check that resources will stay the same since the steal is unknown
      expect(result.current[0].users[victim].resources).toStrictEqual({
        [ResourceType.WOOD]: 1,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
      });

      // victim offers a resource that had the possibility of being stolen
      act(() =>
        offerProposal(
          result.current[1],
          victim,
          [ResourceType.BRICK, ResourceType.WOOD],
          [ResourceType.STONE, ResourceType.STONE],
          result.current[0].users[victim].config.color
        )
      );

      // expect the unknown steal to be solved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);

      // Check players resources
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 2,
        [ResourceType.STONE]: 1,
      });
      expect(result.current[0].users[victim].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves double thefts when stealer offers", () => {
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealer]: [
              ResourceType.SHEEP,
              ResourceType.BRICK,
              ResourceType.WHEAT,
            ],
            [victim]: [
              ResourceType.BRICK,
              ResourceType.WOOD,
              ResourceType.STONE,
              ResourceType.SHEEP,
            ],
          },
          result.current[0].users
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // unknown steal occurs
      act(() =>
        unknownSteal(
          result.current[1],
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );

      // Check that a unknown that was registered
      expect(result.current[0].thefts).toHaveLength(2);

      // Check that resources will stay the same since the steal is unknown
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        [ResourceType.WOOD]: 0,
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 0,
      });

      // stealer offers a resource that had the possibility of being stolen
      act(() =>
        offerProposal(
          result.current[1],
          stealer,
          [ResourceType.WOOD, ResourceType.STONE],
          [ResourceType.WHEAT, ResourceType.BRICK],
          result.current[0].users[stealer].config.color
        )
      );

      // expect the unknown steal to be solved
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);

      // Check players resources
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.STONE]: 1,
        [ResourceType.WOOD]: 1,
      });
      expect(result.current[0].users[victim].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.SHEEP]: 1,
        [ResourceType.BRICK]: 1,
      });
    });
    it("Resolves theft with offer after purchase", () => {
      // Initialize resources and theft
      act(() =>
        givePlayersInitialResources(
          result.current[1],
          {
            [stealer]: [ResourceType.BRICK, ResourceType.WHEAT],
            [victim]: [
              ResourceType.WOOD,
              ResourceType.BRICK,
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
          victim,
          stealer,
          result.current[0].users[stealer].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(1);
      // Purchases a road
      act(() => {
        playerMakesPurchase(
          result.current[1],
          victim,
          PurchaseType.ROAD,
          result.current[0].users[victim].config.color
        );
      });

      // victim offers a resource that had the possibility of being stolen
      act(() =>
        offerProposal(
          result.current[1],
          victim,
          [ResourceType.WOOD, ResourceType.BRICK],
          [ResourceType.WHEAT],
          result.current[0].users[victim].config.color
        )
      );
      // Check the theft record
      expect(result.current[0].thefts).toHaveLength(0);
      expect(result.current[0].thefts).toStrictEqual([]);

      // Check players resources
      expect(result.current[0].users[stealer].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.BRICK]: 1,
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
      });
      expect(result.current[0].users[victim].resources).toStrictEqual({
        ...emptyResources,
        [ResourceType.WOOD]: 1,
        [ResourceType.BRICK]: 1,
      });
    });
  });
  describe("3 dimensional [3 players] unknown steals", () => {
    describe("Victim gets double stolen from different stealers", () => {
      it("Resolves when stealers make offer on what they stole", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealer]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.WHEAT,
              ],
              [stealer2]: [ResourceType.WOOD],
              [victim]: [
                ResourceType.BRICK,
                ResourceType.STONE,
                ResourceType.SHEEP,
              ],
            },
            result.current[0].users
          )
        );

        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer,
            result.current[0].users[stealer].config.color
          )
        );
        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer,
            result.current[0].users[stealer].config.color
          )
        );
        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer2,
            result.current[0].users[stealer2].config.color
          )
        );

        // Check that a unknown that was registered
        expect(result.current[0].thefts).toHaveLength(3);

        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });

        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });

        // stealer2 offers a resource that had the possibility of being stolen
        act(() =>
          offerProposal(
            result.current[1],
            stealer2,
            [ResourceType.STONE],
            [ResourceType.WHEAT],
            result.current[0].users[stealer2].config.color
          )
        );

        // stealer offers a resource that had the possibility of being stolen
        act(() =>
          offerProposal(
            result.current[1],
            stealer,
            [ResourceType.SHEEP],
            [ResourceType.WHEAT],
            result.current[0].users[stealer].config.color
          )
        );

        // expect the unknown steal to be solved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);

        // Check players resources
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 2,
          [ResourceType.WHEAT]: 1,
          [ResourceType.WOOD]: 1,
          [ResourceType.SHEEP]: 1,
        });
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.STONE]: 1,
          [ResourceType.WOOD]: 1,
        });
        expect(result.current[0].users[victim].resources).toStrictEqual({
          ...emptyResources,
        });
      });
      it("Reduces theft possibilities when victim offers a resource that could've been stolen", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealer]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.WHEAT,
              ],
              [stealer2]: [ResourceType.WOOD],
              [victim]: [
                ResourceType.BRICK,
                ResourceType.STONE,
                ResourceType.SHEEP,
              ],
            },
            result.current[0].users
          )
        );

        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer,
            result.current[0].users[stealer].config.color
          )
        );
        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer2,
            result.current[0].users[stealer2].config.color
          )
        );

        // Check that a unknown that was registered
        expect(result.current[0].thefts).toHaveLength(2);
        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });
        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });

        // stealer offers a resource that had the possibility of being stolen
        act(() =>
          offerProposal(
            result.current[1],
            victim,
            [ResourceType.SHEEP],
            [ResourceType.WHEAT],
            result.current[0].users[stealer].config.color
          )
        );

        // expect the unknown steal to be solved
        expect(result.current[0].thefts).toHaveLength(2);
        expect(result.current[0].thefts).toStrictEqual([
          {
            what: { BRICK: 1, STONE: 1 },
            who: { stealer, victim },
          },
          {
            what: { BRICK: 1, STONE: 1 },
            who: { stealer: stealer2, victim },
          },
        ]);

        // Check players resources
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.WOOD]: 1,
        });
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
        });
        expect(result.current[0].users[victim].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.SHEEP]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.STONE]: 1,
        });
      });
      //TODO
      it.skip("Reduces theft possibilities when victim is stolen by stealer and stealer is stolen by stealer2. Stealer2 offers the original stolen resource from victim.", () => {
        // Initialize resources and theft
        act(() =>
          givePlayersInitialResources(
            result.current[1],
            {
              [stealer]: [
                ResourceType.WOOD,
                ResourceType.BRICK,
                ResourceType.WHEAT,
              ], //sheep is stolen
              [stealer2]: [ResourceType.WOOD], //offers sheep
              [victim]: [ResourceType.BRICK, ResourceType.SHEEP], //sheep is stolen
            },
            result.current[0].users
          )
        );

        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            victim,
            stealer,
            result.current[0].users[stealer].config.color
          )
        );
        // unknown steal occurs
        act(() =>
          unknownSteal(
            result.current[1],
            stealer,
            stealer2,
            result.current[0].users[stealer2].config.color
          )
        );

        // Check that a unknown that was registered
        expect(result.current[0].thefts).toHaveLength(2);
        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.BRICK]: 1,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });
        // Check that resources will stay the same since the steal is unknown
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          [ResourceType.WOOD]: 1,
          [ResourceType.WHEAT]: 0,
          [ResourceType.BRICK]: 0,
          [ResourceType.SHEEP]: 0,
          [ResourceType.STONE]: 0,
        });

        // stealer offers a resource that had the possibility of being stolen
        act(() =>
          offerProposal(
            result.current[1],
            stealer2,
            [ResourceType.SHEEP],
            [ResourceType.WHEAT],
            result.current[0].users[stealer].config.color
          )
        );

        // expect the unknown steal to be solved
        expect(result.current[0].thefts).toHaveLength(0);
        expect(result.current[0].thefts).toStrictEqual([]);

        // Check players resources
        expect(result.current[0].users[stealer].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 1,
          [ResourceType.WHEAT]: 1,
          [ResourceType.WOOD]: 1,
          [ResourceType.SHEEP]: 1,
        });
        expect(result.current[0].users[stealer2].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.WOOD]: 1,
        });
        expect(result.current[0].users[victim].resources).toStrictEqual({
          ...emptyResources,
          [ResourceType.BRICK]: 1,
        });
      });
    });
  });
});
