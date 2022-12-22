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
  checkForUserExistence,
  createVictimHash,
  exchangeResourcesPure,
  reduceOtherThefts,
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
      checkForUserExistence(action.payload.user, state.users);
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
      checkForUserExistence(action.payload.user, state.users);
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
        const possibleResourceTheft = calculateTheftForPlayerAndResource(
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
        thefts,
        users,
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
      if (state.thefts.length === 0) return state;
      let thefts = [...state.thefts];

      let users: Users = { ...state.users };
      const offeringPlayer = action.payload.player; //can be stealer or victim

      // Construct a hash of offered resources. (e.g. { wood: 2 })
      const offeredResourcesHash = action.payload.offeredResources.reduce(
        (acc, curr) => {
          acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
          return acc;
        },
        {} as Record<Partial<ResourceType>, number>
      );

      (Object.keys(offeredResourcesHash) as Array<ResourceType>).forEach(
        (offeredResource) => {
          // How many does the player have in hand that we know for sure?
          const resourceInHandCount =
            users[offeringPlayer].resources[offeredResource];

          // How many did he steal and got stolen from others?
          const resourceTheftCount = calculateTheftForPlayerAndResource(
            offeringPlayer,
            offeredResource,
            thefts
          );

          // Offering what he does not have! (TESTED) [STEALER]
          if (resourceInHandCount < offeredResourcesHash[offeredResource]) {
            // Did the player get this from something he stole?
            if (
              offeredResourcesHash[offeredResource] - resourceInHandCount <=
              resourceTheftCount
            ) {
              // Find the theft and eliminate it since we figured out what was stolen
              for (let i = 0; i < thefts.length; i++) {
                if (
                  thefts[i].who.stealer === offeringPlayer &&
                  !!thefts[i].what[offeredResource]
                ) {
                  // Update the resources
                  users = exchangeResourcesPure(
                    users,
                    thefts[i].who.victim,
                    offeringPlayer,
                    [offeredResource] as ResourceType[]
                  );
                  thefts = reduceOtherThefts(
                    thefts,
                    thefts[i].who.victim,
                    offeredResource
                  );
                  // Resolve theft
                  thefts.splice(i, 1);
                }
              }
            }
          }
          // Offering what we thought was stolen (TESTED) [VICTIM]
          else if (
            offeredResourcesHash[offeredResource] >
            resourceInHandCount + resourceTheftCount
          ) {
            console.log(
              "offeredResource",
              offeredResource,
              "resourceTheftCount",
              resourceTheftCount,
              "resourceInHandCount",
              resourceInHandCount
            );

            // Parse through theft
            for (let i = 0; i < thefts.length; i++) {
              const wasResourceOfferedPossiblyStolen =
                !!thefts[i].what[offeredResource];

              const isOfferingPlayerVictim =
                thefts[i].who.victim === offeringPlayer;

              /**
               * This is the case where the victim that got stolen is offering something.
               */
              if (isOfferingPlayerVictim && wasResourceOfferedPossiblyStolen) {
                // Reduced the steal possibilities
                delete thefts[i].what[offeredResource];

                console.log(
                  "Theft possibilities reduced!",
                  thefts[i],
                  offeredResource
                );
              }
            }

            /**
             * If the number of thefts for a specific victim is the same amount of possible resource that can be
             * stolen then it is safe to assume that those were the resources stolen.
             *
             * For example:
             *  [
             *    {"what": {"SHEEP": 1, "STONE": 1}, "who": {"stealer": "Gali", "victim": "Alex"}},
             *    {"what": {"SHEEP": 1, "STONE": 1}, "who": {"stealer": "Kelvin", "victim": "Alex"}}
             *  ]
             * Here we see that Alex was a victim twice. We can also see that he only has 2 possible resources to
             * be stolen from. Thus it is safe to conclude that what was stolen was the SHEEP and the STONE. However, we
             * just wont know where that stolen resource end up. If the stealer is the same then we know that both were sent
             * to the stealer
             *
             */
            const victimHash = createVictimHash(thefts);
            const alreadyDeleted = {};
            for (let i = 0; i < thefts.length; i++) {
              const players = `${thefts[i].who.victim}_${thefts[i].who.stealer}`;
              const possibleResourceStolen = Object.keys(thefts[i].what).join(
                "_"
              );
              const key = `${players}:${possibleResourceStolen}`;

              if (
                victimHash[key].reoccurrence === victimHash[key].resourceAmount
              ) {
                if (!alreadyDeleted[key]) {
                  // Update the resources
                  users = exchangeResourcesPure(
                    users,
                    thefts[i].who.victim,
                    thefts[i].who.stealer,
                    Object.keys(thefts[i].what) as ResourceType[]
                  );
                  console.log(
                    "Exchange was executed",
                    Object.keys(thefts[i].what),
                    key
                  );
                } else {
                  console.log("Was already exchanged", alreadyDeleted, key);
                }
                thefts.splice(i, 1);
                i--;
                console.log(
                  "Theft solved because the amount of steals matched the possible resources that can be stolen!"
                );
                alreadyDeleted[key] = 1;
              }
            }
          }
        }
      );

      // Check that there is no one resources possibility such as
      // [{what: {WOOD: 1}, who: {stealer: Gali, victim: kelvin}}]
      for (let x = 0; x < thefts.length; x++) {
        const remainingResourcePossibilities = Object.keys(
          thefts[x].what
        ) as ResourceType[];

        if (
          remainingResourcePossibilities.length === 1 &&
          thefts[x].what[Object.keys(thefts[x].what)[0]] === 1
        ) {
          /**
           * After the steal possibilities are reduced, if the remaining possibility is 1 then we
           * know what was stolen.
           */
          if (remainingResourcePossibilities.length === 1) {
            users = exchangeResourcesPure(
              users,
              thefts[x].who.victim,
              thefts[x].who.stealer,
              remainingResourcePossibilities
            );
            // Resolve theft
            thefts.splice(x, 1);
            console.log("Theft solved!", remainingResourcePossibilities);
          }
        }
      }

      return { users, thefts };
    }
    case ActionType.UNKNOWN_STEAL: {
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
        return { users, thefts };
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
     * - Monoply card is played
     */
    case ActionType.REVIEW_STEALS: {
      if (state.thefts.length === 0) return state;
      let users: Users = { ...state.users };
      let thefts = [...state.thefts];

      const player = action.payload.player;

      // PURCHASE
      for (const resource in ResourceType) {
        const resourceCount = users[player].resources[resource]; // How many resources does the player currently have
        const resourceTheftCount = calculateTheftForPlayerAndResource(
          // How many times did this player get stolen from?
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
        }
        // Victim [Player (Purchaser)] is able to purchase something which wouldnt be possible if that resource was stolen
        else if (resourceCount === 0 && theftAndResourceSum === -1) {
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

      return { users, thefts };
    }
    default:
      return state;
  }
};
