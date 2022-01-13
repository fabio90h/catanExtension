import React from "react";
import {
  GameData,
  PurchaseType,
  ResourceType,
  Theft,
  UserConfig,
  UserResources,
  Users,
} from "./types";
import {
  calculateTheftForPlayerAndResource,
  checkForUserExistance,
  exchangeResourcesPure,
} from "./utils/index.";

export enum ActionType {
  PURCHASE = "PURCHASE",
  ADD_RESOURCES = "ADD_RESOURCES",
  SUBTRACT_RESOURCES = "SUBTRACT_RESOURCES",
  INITIALIZE_USER = "INITIALIZE_USER",
  STEAL_ALL = "STEAL_ALL",
  UNKNOWN_STEAL = "UNKNOWN_STEAL",
  RESOLVE_UNKNOWN_STEAL = "RESOLVE_UNKNOWN_STEAL",
  RESOLVE_UNKNOWN_STEAL_WITH_OFFERS = "RESOLVE_UNKNOWN_STEAL_WITH_OFFERS",
  REVIEW_STEALS = "REVIEW_STEALS",
}

export type Action =
  | {
      type: ActionType.INITIALIZE_USER;
      payload: {
        user: string;
        color: string;
        startingResources: Array<string>;
      };
    }
  | {
      type: ActionType.ADD_RESOURCES;
      payload: { user: string; addResources: ResourceType[] };
    }
  | {
      type: ActionType.SUBTRACT_RESOURCES;
      payload: { user: string; subtractResources: ResourceType[] };
    }
  | {
      type: ActionType.PURCHASE;
      payload: { user: string; purchase: PurchaseType };
    }
  | {
      type: ActionType.STEAL_ALL;
      payload: {
        user: string;
        stolenResource: ResourceType;
        stoleAmount: number;
      };
    }
  | {
      type: ActionType.UNKNOWN_STEAL;
      payload: {
        stealer: string;
        victim: string;
      };
    }
  | {
      type: ActionType.RESOLVE_UNKNOWN_STEAL;
      payload: {
        id: number;
      };
    }
  | {
      type: ActionType.RESOLVE_UNKNOWN_STEAL_WITH_OFFERS;
      payload: {
        offeredResources: ResourceType[];
        wantedResources: ResourceType[];
        player: string;
      };
    }
  | {
      type: ActionType.REVIEW_STEALS;
      payload: {
        player: string;
      };
    };

export const reducer: React.Reducer<GameData, Action> = (state, action) => {
  switch (action.type) {
    case ActionType.INITIALIZE_USER: {
      const users: Users = { ...state.users };

      const resources: UserResources = {
        [ResourceType.WOOD]: 0,
        [ResourceType.SHEEP]: 0,
        [ResourceType.STONE]: 0,
        [ResourceType.WHEAT]: 0,
        [ResourceType.BRICK]: 0,
      };
      action.payload.startingResources.forEach(
        (resource) => (resources[resource] += 1)
      );
      return {
        ...state,
        users: {
          ...users,
          [action.payload.user]: {
            resources,
            config: { color: action.payload.color },
          },
        },
      };
    }
    case ActionType.ADD_RESOURCES: {
      checkForUserExistance(action.payload.user, state.users);
      const users: Users = { ...state.users };
      const tempResources: UserResources = {
        ...users[action.payload.user].resources,
      };
      const tempConfig: UserConfig = { ...users[action.payload.user].config };

      action.payload.addResources.forEach(
        (resource) => (tempResources[resource] += 1)
      );

      return {
        ...state,
        users: {
          ...users,
          [action.payload.user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.SUBTRACT_RESOURCES: {
      checkForUserExistance(action.payload.user, state.users);
      const users: Users = { ...state.users };

      const tempResources: UserResources = {
        ...users[action.payload.user].resources,
      };
      const tempConfig: UserConfig = { ...users[action.payload.user].config };

      action.payload.subtractResources.forEach(
        (resource) => (tempResources[resource] -= 1)
      );

      return {
        ...state,
        users: {
          ...users,
          [action.payload.user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.PURCHASE: {
      checkForUserExistance(action.payload.user, state.users);
      const users: Users = { ...state.users };

      const tempResources: UserResources = {
        ...users[action.payload.user].resources,
      };
      const tempConfig: UserConfig = { ...users[action.payload.user].config };

      switch (action.payload.purchase) {
        case PurchaseType.CITY: {
          tempResources[ResourceType.WHEAT] -= 2;
          tempResources[ResourceType.STONE] -= 3;
          break;
        }
        case PurchaseType.ROAD: {
          tempResources[ResourceType.WOOD] -= 1;
          tempResources[ResourceType.BRICK] -= 1;
          break;
        }
        case PurchaseType.SETTLEMENT: {
          tempResources[ResourceType.WOOD] -= 1;
          tempResources[ResourceType.BRICK] -= 1;
          tempResources[ResourceType.WHEAT] -= 1;
          tempResources[ResourceType.SHEEP] -= 1;
          break;
        }
        case PurchaseType.DEVELOPMENT: {
          tempResources[ResourceType.STONE] -= 1;
          tempResources[ResourceType.WHEAT] -= 1;
          tempResources[ResourceType.SHEEP] -= 1;
          break;
        }
      }

      return {
        ...state,
        users: {
          ...users,
          [action.payload.user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.STEAL_ALL: {
      checkForUserExistance(action.payload.user, state.users);
      const users: Users = { ...state.users };

      const tempResources: UserResources = {
        ...users[action.payload.user].resources,
      };
      const tempConfig: UserConfig = { ...users[action.payload.user].config };

      //Remove resource from each player
      Object.keys(users).forEach((player) => {
        if (player !== action.payload.user)
          users[player].resources[action.payload.stolenResource] = 0;
      });

      //Add the stolen resources to the player
      tempResources[action.payload.stolenResource] +=
        action.payload.stoleAmount;

      return {
        ...state,
        users: {
          ...users,
          [action.payload.user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.RESOLVE_UNKNOWN_STEAL: {
      const thefts = [...state.thefts];
      const users: Users = { ...state.users };

      thefts.splice(action.payload.id, 1);

      return {
        users,
        thefts,
      };
    }
    case ActionType.RESOLVE_UNKNOWN_STEAL_WITH_OFFERS: {
      const thefts = [...state.thefts];
      let users: Users = { ...state.users };

      const player = action.payload.player;

      //Construct a hash of offered resources.
      const offeredResourcesHash = action.payload.offeredResources.reduce(
        (acc, curr) => {
          acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
          return acc;
        },
        {} as Record<Partial<ResourceType>, number>
      );

      (Object.keys(offeredResourcesHash) as Array<ResourceType>).forEach(
        (resource) => {
          // How many does the player have in hand that we know for sure?
          const resourceCount = users[player].resources[resource];

          // How many did he steal and got stolen from others?
          const resourceTheftCount = calculateTheftForPlayerAndResource(
            player,
            resource,
            thefts
          );

          // Offering what he does not have! (TESTED)
          if (resourceCount < offeredResourcesHash[resource]) {
            // Did the player get this from something he stole?
            if (
              offeredResourcesHash[resource] - resourceCount <=
              resourceTheftCount
            ) {
              // Find the theft and eliminate it since we figured out what was stolen
              for (let i = 0; i < thefts.length; i++) {
                if (
                  thefts[i].who.stealer === player &&
                  !!thefts[i].what[resource]
                ) {
                  // Update the resources
                  users = exchangeResourcesPure(
                    users,
                    thefts[i].who.victim,
                    player,
                    [resource] as ResourceType[]
                  );

                  // Resolve theft
                  thefts.splice(i, 1);
                }
              }
            }
          }
          // Offering what we thought was stolen (TESTED)
          else if (
            offeredResourcesHash[resource] >
            resourceCount + resourceTheftCount
          ) {
            for (let i = 0; i < thefts.length; i++) {
              if (
                thefts[i].who.victim === player &&
                !!thefts[i].what[resource]
              ) {
                // Reduced the steal possibilities
                delete thefts[i].what[resource];
                console.log(
                  "Theft possibilities reduced!",
                  thefts[i],
                  resource
                );

                // After the steal possibilities are reduced, if the remaining possiblity is 1 then we
                // know what was stolen.
                const remainingResourcePossibilities = Object.keys(
                  thefts[i].what
                ) as ResourceType[];

                if (remainingResourcePossibilities.length === 1) {
                  users = exchangeResourcesPure(
                    users,
                    player,
                    thefts[i].who.stealer,
                    remainingResourcePossibilities
                  );
                  // Resolve theft
                  thefts.splice(i, 1);
                  console.log("Theft solved!", thefts[i]);
                }
                break;
              }
            }
          }
        }
      );

      return { users, thefts };
    }
    case ActionType.UNKNOWN_STEAL: {
      checkForUserExistance(action.payload.victim, state.users);
      checkForUserExistance(action.payload.stealer, state.users);

      const users: Users = { ...state.users };
      const thefts = [...state.thefts];

      const stealerResources: UserResources = {
        ...users[action.payload.stealer].resources,
      };
      const stealerConfig: UserConfig = {
        ...users[action.payload.stealer].config,
      };
      const victimResources: UserResources = {
        ...users[action.payload.victim].resources,
      };
      const victimConfig: UserConfig = {
        ...users[action.payload.victim].config,
      };

      // List the possibleResouceStolen
      const possibleResourceStolen: Partial<UserResources> = {};
      for (const resource in ResourceType) {
        if (victimResources[resource] > 0) {
          possibleResourceStolen[resource as ResourceType] = 1;
        }
      }

      const possibleResouceStolenArray = Object.keys(
        possibleResourceStolen
      ) as ResourceType[];

      const theft: Theft = {
        who: {
          victim: action.payload.victim,
          stealer: action.payload.stealer,
        },
        what: possibleResourceStolen,
      };

      //One or nothing thing can be stolen
      if (possibleResouceStolenArray.length <= 1) {
        console.log("less than or equal to one");
        possibleResouceStolenArray.forEach((resource) => {
          victimResources[resource] -= 1;
          stealerResources[resource] += 1;
        });

        return {
          ...state,
          users: {
            ...users,
            [action.payload.stealer]: {
              resources: stealerResources,
              config: stealerConfig,
            },
            [action.payload.victim]: {
              resources: victimResources,
              config: victimConfig,
            },
          },
          thefts,
        };
      } else {
        console.log("more than one");
        //Set prompt to pick resource or unknown
        return {
          users,
          thefts: [...thefts, theft],
        };
      }
    }
    /**
     * ## Should consider:
     * - Stealer or victim offers a deal that couldnt have been possible.
     * - Stealer or victim is able to purchase something which wouldnt be possible if that resource was stolen
     * - Stealer or victim is able to make a trade with the bank
     * - Stealer or victim discards resource the couldnt have been possible.
     *
     * - Victim got stolen once. The resource stolen was one and only. Victim gets stolen twice. We know that the previous stolen resource
     *   is not the resource that was stolen.
     *
     * ### This should be executed when:
     * - Victim makes an offer, buys, stole or is stolen from.
     * - Stealer makes an offer or buys, stole or is stolen from.
     * - Monoply card is played
     */
    case ActionType.REVIEW_STEALS: {
      if (state.thefts.length === 0) return state;
      let users: Users = { ...state.users };
      const thefts = [...state.thefts];

      const player = action.payload.player;

      // PURCHASE
      for (const resource in ResourceType) {
        const resourceCount = users[player].resources[resource];
        const resourceTheftCount = calculateTheftForPlayerAndResource(
          player,
          resource as ResourceType,
          thefts
        );
        const theftAndResourceSum = resourceCount + resourceTheftCount;

        if (theftAndResourceSum < -1)
          throw Error(
            "Steals and resource count dont add up. Something went wrong."
          );

        // Stealer[Player (Purchaser)] is able to purchase something which wouldnt be possible if that resource was not stolen
        if (resourceCount === -1 && theftAndResourceSum === 0) {
          for (let i = 0; i < thefts.length; i++) {
            if (
              thefts[i].who.stealer === player &&
              !!thefts[i].what[resource]
            ) {
              // Update the resources
              users = exchangeResourcesPure(
                users,
                thefts[i].who.victim,
                player,
                [resource] as ResourceType[]
              );

              // Resolve theft
              thefts.splice(i, 1);
            }
          }
        }
        // Victim [Player (Purchaser)] is able to purchase something which wouldnt be possible if that resource was stolen
        else if (resourceCount === 0 && theftAndResourceSum === -1) {
          for (let i = 0; i < thefts.length; i++) {
            if (thefts[i].who.victim === player && !!thefts[i].what[resource]) {
              // Reduced the steal possibilities
              delete thefts[i].what[resource];
              console.log("Theft possibilities reduced!", thefts[i], resource);

              // After the steal possibilities are reduced, if the remaining possiblity is 1 then we
              // know what was stolen.
              const remainingResourcePossibilities = Object.keys(
                thefts[i].what
              ) as ResourceType[];

              if (remainingResourcePossibilities.length === 1) {
                users = exchangeResourcesPure(
                  users,
                  player,
                  thefts[i].who.stealer,
                  remainingResourcePossibilities
                );
                // Resolve theft
                console.log("Theft solved!", thefts[i]);
                thefts.splice(i, 1);
              }
              break;
            }
          }
        }
      }

      // CHECK IF RESOURCES ARE IN PLAY
      // Does not work for purchase
      // for (const resource in ResourceType) {
      //   const totalResourceInPlay = Object.values(users).reduce(
      //     (acc, curr) => acc + curr.resources[resource],
      //     0
      //   );

      //   console.log("totalResourceInPlay", resource, totalResourceInPlay);

      //   if (totalResourceInPlay === 0) {
      //     for (let i = 0; i < thefts.length; i++) {
      //       delete thefts[i].what[resource];

      //       console.log("thefts", thefts[i].what, resource);

      //       const remainingOptions = Object.keys(
      //         thefts[i].what
      //       ) as ResourceType[];
      //       if (remainingOptions.length === 1) {
      //         users = exchangeResourcesPure(
      //           users,
      //           thefts[i].who.victim,
      //           thefts[i].who.stealer,
      //           remainingOptions
      //         );

      //         console.log(
      //           "Theft solved! Based on how many resources are in play",
      //           thefts[i]
      //         );
      //         // Resolve theft
      //         thefts.splice(i, 1);
      //       }
      //     }
      //   }
      // }

      return { users, thefts };
    }
    default:
      return state;
  }
};
