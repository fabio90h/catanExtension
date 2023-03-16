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
import { calculateTheftForPlayerAndResources } from "./utils/helpers/general/calculateTheftForPlayerAndResources/calculateTheftForPlayerAndResources.general";
import { checkForUserExistence } from "./utils/helpers/general/checkForUserExistence/checkForUserExistence.general";
import { exchangeResourcesPure } from "./utils/helpers/general/exchangeResourcesPure/exchangeResourcesPure.general";
import { reduceOtherThefts } from "./utils/helpers/general/reduceOtherThefts/reduceOtherThefts.general";
import {
  checkForOneResourceThefts,
  doubleUnknownStealResolve,
  hashCounter,
} from "./utils/index.";

export enum ActionType {
  SET_USERNAME = "SET_USERNAME",
  PURCHASE = "PURCHASE",
  ADD_RESOURCES = "ADD_RESOURCES",
  SUBTRACT_RESOURCES = "SUBTRACT_RESOURCES",
  INITIALIZE_USER = "INITIALIZE_USER",
  STEAL_ALL = "STEAL_ALL",
  UNKNOWN_STEAL = "UNKNOWN_STEAL",
  RESOLVE_UNKNOWN_STEAL = "RESOLVE_UNKNOWN_STEAL",
  RESOLVE_UNKNOWN_STEAL_WITH_OFFERS = "RESOLVE_UNKNOWN_STEAL_WITH_OFFERS",
  REVIEW_STEALS = "REVIEW_STEALS",
  REVIEW_STEALS_WITH_ACTION = "REVIEW_STEALS_WITH_ACTION",
  STOLE_FROM_YOU = "STOLE_FROM_YOU",
}

export type Action =
  | {
      type: ActionType.SET_USERNAME;
      payload: {
        username: string;
      };
    }
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
      payload: { user: string; addResources: ResourceType[]; isUser?: Boolean };
    }
  | {
      type: ActionType.SUBTRACT_RESOURCES;
      payload: {
        user: string;
        subtractResources: ResourceType[];
        isUser?: Boolean;
      };
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
      type: ActionType.REVIEW_STEALS_WITH_ACTION;
      payload: {
        actionWithResources: ResourceType[];
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
    case ActionType.SET_USERNAME: {
      return {
        ...state,
        username: action.payload.username,
      };
    }
    case ActionType.INITIALIZE_USER: {
      const users: Users = { ...state.users };
      console.log("INITIALIZE_USER", state.username);
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
      const users: Users = { ...state.users };
      const user = action.payload.isUser ? state.username : action.payload.user;

      checkForUserExistence(user, state.users);
      const tempResources: UserResources = {
        ...users[user].resources,
      };
      console.log("testerFH_ADD_RESOURCES", user);
      const tempConfig: UserConfig = { ...users[user].config };

      action.payload.addResources.forEach(
        (resource) => (tempResources[resource] += 1)
      );

      return {
        ...state,
        users: {
          ...users,
          [user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.SUBTRACT_RESOURCES: {
      console.log("SUBTRACT_RESOURCES", state.username);
      const users: Users = { ...state.users };

      const user = action.payload.isUser ? state.username : action.payload.user;
      checkForUserExistence(user, state.users);
      console.log("testerFH_SUBTRACT_RESOURCES", user);

      const tempResources: UserResources = {
        ...users[user].resources,
      };
      const tempConfig: UserConfig = { ...users[user].config };

      action.payload.subtractResources.forEach(
        (resource) => (tempResources[resource] -= 1)
      );

      return {
        ...state,
        users: {
          ...users,
          [user]: {
            resources: tempResources,
            config: tempConfig,
          },
        },
      };
    }
    case ActionType.PURCHASE: {
      console.log("PURCHASE", state.username);
      checkForUserExistence(action.payload.user, state.users);
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
      console.log("STEAL_ALL", state.username);
      checkForUserExistence(action.payload.user, state.users);
      let users: Users = { ...state.users };
      let thefts: Theft[] = [...state.thefts];

      const maxPossibleResourcesToGrab =
        Object.values(users).reduce(
          (acc, curr) => acc + curr.resources[action.payload.stolenResource],
          0
        ) - users[action.payload.user].resources[action.payload.stolenResource];

      // RESOLVE THEFT //TODO: CAN BE REFACTORED
      // Only if the max steals matches the amount it actually stole
      if (action.payload.stoleAmount === maxPossibleResourcesToGrab) {
        // Remove any monopolize resource from the theft
        thefts.forEach(
          (theft) =>
            !!theft.what[action.payload.stolenResource] &&
            delete theft.what[action.payload.stolenResource]
        );

        // Filter out any "theft.what" with length 1 since we can resolve them
        thefts = thefts.filter((theft) => {
          const remainingResourcePossibilities = Object.keys(
            theft.what
          ) as ResourceType[];

          if (remainingResourcePossibilities.length === 1) {
            users = exchangeResourcesPure(
              users,
              theft.who.victim,
              theft.who.stealer,
              remainingResourcePossibilities
            );
            console.log("Theft solved!", theft);
            return false;
          }
          return true;
        });
      } else {
        // If stealer steals then plays monopoly
        //TODO: REFACTOR: Counts the amount of times a specific resource
        const possibleResourceTheft = calculateTheftForPlayerAndResources(
          action.payload.user,
          action.payload.stolenResource,
          thefts
        );

        if (
          possibleResourceTheft + action.payload.stoleAmount ===
          maxPossibleResourcesToGrab
        ) {
          // Filter out any "theft.what" with length 1 since we can resolve them
          thefts = thefts.filter((theft) => {
            if (
              theft.who.stealer === action.payload.user &&
              !!theft.what[action.payload.stolenResource]
            ) {
              users[theft.who.stealer].resources[
                action.payload.stolenResource
              ] += 1;
              console.log("Theft solved!", theft);
              return false;
            } else if (
              theft.who.victim === action.payload.user &&
              !!theft.what[action.payload.stolenResource]
            ) {
              users[theft.who.victim].resources[
                action.payload.stolenResource
              ] -= 1;
              console.log("Theft solved!", theft);
              return false;
            }
            return true;
          });
        }
      }

      //Remove resource from each player
      Object.keys(users).forEach((player) => {
        if (player !== action.payload.user)
          users[player].resources[action.payload.stolenResource] = 0;
      });

      //Add the stolen resources to the player
      users[action.payload.user].resources[action.payload.stolenResource] +=
        action.payload.stoleAmount;

      return {
        ...state,
        thefts,
        users,
      };
    }
    case ActionType.RESOLVE_UNKNOWN_STEAL: {
      console.log("RESOLVE_UNKNOWN_STEAL", state.username);
      const thefts = [...state.thefts];
      const users: Users = { ...state.users };

      thefts.splice(action.payload.id, 1);

      return {
        ...state,
        users,
        thefts,
      };
    }
    case ActionType.RESOLVE_UNKNOWN_STEAL_WITH_OFFERS: {
      console.log("RESOLVE_UNKNOWN_STEAL_WITH_OFFERS", state.username);
      if (state.thefts.length === 0) return state;

      let thefts = [...state.thefts];
      let users: Users = { ...state.users };
      const offeringPlayer = action.payload.player; //can be stealer or victim
      // Construct a hash of offered resources. (e.g. { wood: 2 })
      const offeredResourcesHash = hashCounter(action.payload.offeredResources);

      // Go through every offered resource to see if we can resolve or reduce some unknown thefts
      action.payload.offeredResources.forEach((offeredResource) => {
        // How many does the player have in hand that we know for sure?
        const resourceInHandCount =
          users[offeringPlayer].resources[offeredResource];

        // How many did he steal and got stolen from others?
        const resourceTheftCount = calculateTheftForPlayerAndResources(
          offeringPlayer,
          offeredResource,
          thefts
        );

        /**
         * Offering what he does not have! [STEALER]
         *
         * This is where there is no stolen possibility reduction. We will solve the theft
         * mystery since the stealer did not have this resource prior to the steals.
         *
         */
        if (resourceInHandCount < offeredResourcesHash[offeredResource]) {
          // Did the player get this from something he stole?
          if (
            offeredResourcesHash[offeredResource] - resourceInHandCount <=
            resourceTheftCount
          ) {
            // Find the theft and eliminate it since we figured out what was stolen
            thefts.forEach((theft, i) => {
              if (
                theft.who.stealer === offeringPlayer &&
                !!theft.what[offeredResource]
              ) {
                // Update the resources
                users = exchangeResourcesPure(
                  users,
                  theft.who.victim,
                  offeringPlayer,
                  [offeredResource] as ResourceType[]
                );
                // Since we solved a theft for one. There is opportunity
                // to reduce the theft possibilities for others
                thefts = reduceOtherThefts(
                  thefts,
                  theft.who.victim,
                  offeredResource
                );
                // Resolve theft
                thefts.splice(i, 1);
              }
            });
          }
        } else if (
          /**
           * Offering what we thought was stolen [VICTIM]
           *
           * We reduce the possible resource that was stolen
           */
          offeredResourcesHash[offeredResource] >
          resourceInHandCount + resourceTheftCount
        ) {
          // Go through each theft to see if we can reduce some theft possibilities
          thefts.forEach((theft) => {
            const wasResourceOfferedPossiblyStolen =
              !!theft.what[offeredResource];

            const isOfferingPlayerVictim = theft.who.victim === offeringPlayer;

            /**
             * This is the case where the victim that got stolen is offering something.
             */
            if (isOfferingPlayerVictim && wasResourceOfferedPossiblyStolen) {
              // Reduced the steal possibilities
              delete theft.what[offeredResource];

              console.log(
                "Theft possibilities reduced!",
                theft,
                offeredResource
              );
            }
          });
          [thefts, users] = doubleUnknownStealResolve(thefts, users);
        }
      });

      // Check that there is no one resources possibility such as
      // [{what: {WOOD: 1}, who: {stealer: Gali, victim: kelvin}}]
      [thefts, users] = checkForOneResourceThefts(thefts, users);

      return { ...state, thefts, users };
    }
    case ActionType.UNKNOWN_STEAL: {
      console.log("UNKNOWN_STEAL", state.username);
      checkForUserExistence(action.payload.victim, state.users);
      checkForUserExistence(action.payload.stealer, state.users);

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

      // List the possibleResourceStolen and the amount of resource
      // the victim currently holds.
      const possibleResourceStolen: Partial<UserResources> = {};
      for (const resource in ResourceType) {
        if (victimResources[resource] > 0) {
          possibleResourceStolen[resource as ResourceType] =
            victimResources[resource];
        }
      }

      // Check Theft to see what are the some resource that could be up for a re-steal

      const possibleResourceStolenArray = Object.keys(
        possibleResourceStolen
      ) as ResourceType[];

      const theft: Theft = {
        who: {
          victim: action.payload.victim,
          stealer: action.payload.stealer,
        },
        what: possibleResourceStolen,
      };

      // TODO: Refactor this function
      const indexOfStealerBeingVictim = thefts.findIndex((_) => {
        const test =
          JSON.stringify(Object.keys(_.what)) ===
          JSON.stringify(
            Object.keys(users[_.who.victim].resources).filter(
              (resource) => users[_.who.victim].resources[resource] > 0
            )
          );

        if (test) {
          theft.who.victim = _.who.victim;
        }
        return test;
      });

      const victimResourcesCount =
        victimResources[ResourceType.BRICK] +
        victimResources[ResourceType.WOOD] +
        victimResources[ResourceType.WHEAT] +
        victimResources[ResourceType.STONE] +
        victimResources[ResourceType.SHEEP];

      //One or nothing thing can be stolen
      if (victimResourcesCount === 0 && indexOfStealerBeingVictim >= 0) {
        thefts[indexOfStealerBeingVictim] = theft;
        return { ...state, users, thefts };
      } else if (possibleResourceStolenArray.length <= 1) {
        console.log("less than or equal to one");
        possibleResourceStolenArray.forEach((resource) => {
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
          ...state,
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
     * - **Victim got stolen once. The resource stolen was one and only. Victim gets stolen twice. We know that the previous stolen resource
     *   is not the resource that was stolen.
     *
     * ### This should be executed when:
     * - Victim makes an offer, buys, stole or is stolen from.
     * - Stealer makes an offer or buys, stole or is stolen from.
     * - Monopoly card is played
     */
    case ActionType.REVIEW_STEALS: {
      console.log("REVIEW_STEALS", state.username);
      if (state.thefts.length === 0) return state;
      let users: Users = { ...state.users };
      let thefts = [...state.thefts];

      let player = action.payload.player;
      console.log("testerFH_REVIEW_STEALS", player);

      // PURCHASE
      for (const resource in ResourceType) {
        const resourceCount = users[player].resources[resource]; // How many resources does the player currently have
        const resourceTheftCount = calculateTheftForPlayerAndResources(
          // How many times did this player get stolen from?
          player,
          resource as ResourceType,
          thefts
        );
        const theftAndResourceSum = resourceCount + resourceTheftCount;
        console.log(
          "resource",
          resource,
          resourceCount,
          resourceTheftCount,
          theftAndResourceSum
        );
        // if (theftAndResourceSum < -1)
        //   throw Error(
        //     "Steals and resource count dont add up. Something went wrong."
        //   );

        /**
         * Buying something with not enough resources [STEALER]
         *
         * This is where the stealer buys with a resource he stole thus resolving
         * a unknown theft
         */
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
              thefts = reduceOtherThefts(
                thefts,
                thefts[i].who.victim,
                resource as ResourceType
              );
              // Resolve theft
              console.log("Theft solved!", thefts[i]);
              // Resolve theft
              thefts.splice(i, 1);
            }
          }
        } else if (resourceCount === 0 && theftAndResourceSum === -1) {
          /**
           * Buying something with a resource that could have been stolen [VICTIM]
           *
           * We are able to reduce the theft possibility since we know that one
           * of the resources was not stolen since it was used in a purchase
           */
          for (let i = 0; i < thefts.length; i++) {
            if (thefts[i].who.victim === player && !!thefts[i].what[resource]) {
              // Reduced the steal possibilities
              delete thefts[i].what[resource];
              console.log("Theft possibilities reduced!", thefts[i], resource);

              // After the steal possibilities are reduced, if the remaining possibility is 1 then we
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

      return { ...state, users, thefts };
    }
    case ActionType.REVIEW_STEALS_WITH_ACTION: {
      console.log("REVIEW_STEALS_WITH_ACTION", state.username);
      if (state.thefts.length === 0) return state;

      let thefts = [...state.thefts];
      let users: Users = { ...state.users };
      const playerWithAction = action.payload.player; //can be stealer or victim
      // Construct a hash of offered resources. (e.g. { wood: 2 })
      const paidResourcesHash = hashCounter(action.payload.actionWithResources);

      // Go through every offered resource to see if we can resolve or reduce some unknown thefts
      action.payload.actionWithResources.forEach((offeredResource) => {
        // How many does the player have in hand that we know for sure?
        const resourceInHandCount =
          users[playerWithAction].resources[offeredResource];

        // How many did he steal and got stolen from others?
        const resourceTheftCount = calculateTheftForPlayerAndResources(
          playerWithAction,
          offeredResource,
          thefts
        );

        /**
         *  Buying with resources he does not have! [STEALER]
         *
         * This is where there is no stolen possibility reduction. We will solve the theft
         * mystery since the stealer did not have this resource prior to the steals.
         *
         */
        if (resourceInHandCount < paidResourcesHash[offeredResource]) {
          // TODO: who did the playerWithAction steal from? List them in order
          //const playerWithActionVictims = checkPlayerStealHistory(playerWithAction, thefts)
          // TODO: check the possible theft resource of the victim
          // TODO: update the theft of playerWithAction to consider the stolen item that his victim stole

          // Did the player get this from something he stole?
          if (
            paidResourcesHash[offeredResource] - resourceInHandCount <=
            resourceTheftCount
          ) {
            // Find the theft and eliminate it since we figured out what was stolen
            thefts.forEach((theft, i) => {
              if (
                theft.who.stealer === playerWithAction &&
                !!theft.what[offeredResource]
              ) {
                // Update the resources
                users = exchangeResourcesPure(
                  users,
                  theft.who.victim,
                  playerWithAction,
                  [offeredResource] as ResourceType[]
                );
                // Since we solved a theft for one. There is opportunity
                // to reduce the theft possibilities for others
                thefts = reduceOtherThefts(
                  thefts,
                  theft.who.victim,
                  offeredResource
                );
                // Resolve theft
                thefts.splice(i, 1);
              }
            });
          }
        } else if (
          /**
           * Buying with resources we thought was stolen [VICTIM]
           *
           * We reduce the possible resource that was stolen
           */
          paidResourcesHash[offeredResource] >
          resourceInHandCount + resourceTheftCount
        ) {
          // Go through each theft to see if we can reduce some theft possibilities
          thefts.forEach((theft) => {
            const wasResourceOfferedPossiblyStolen =
              !!theft.what[offeredResource];

            const isActionPlayerVictim = theft.who.victim === playerWithAction;

            /**
             * This is the case where the victim that got stolen is offering something.
             */
            if (isActionPlayerVictim && wasResourceOfferedPossiblyStolen) {
              // Reduced the steal possibilities
              if ((theft.what[offeredResource] || 0) > 1) {
                theft.what[offeredResource] =
                  (theft.what[offeredResource] || 0) - 1;
              } else {
                delete theft.what[offeredResource];
              }

              console.log(
                "Theft possibilities reduced!",
                theft,
                offeredResource
              );
            }
          });
          console.log("here", thefts);
          [thefts, users] = doubleUnknownStealResolve(thefts, users);
        }
      });

      // Check that there is no one resources possibility such as
      // [{what: {WOOD: 1}, who: {stealer: Gali, victim: kelvin}}]
      [thefts, users] = checkForOneResourceThefts(thefts, users);

      return { ...state, thefts, users };
    }
    default:
      return state;
  }
};
