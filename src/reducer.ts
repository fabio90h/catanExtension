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
import { checkForUserExistance } from "./utils/index.";

export enum ActionType {
  PURCHASE = "PURCHASE",
  ADD_RESOURCES = "ADD_RESOURCES",
  SUBTRACT_RESOURCES = "SUBTRACT_RESOURCES",
  INITIALIZE_USER = "INITIALIZE_USER",
  STEAL_ALL = "STEAL_ALL",
  UNKNOWN_STEAL = "UNKNOWN_STEAL",
  RESOLVE_UNKNOWN_STEAL = "RESOLVE_UNKNOWN_STEAL",
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
      tempResources[action.payload.stolenResource] = action.payload.stoleAmount;

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

      console.log("mutatedThefts", thefts);

      return {
        users,
        thefts,
      };
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
      const possibleResourceStolen: ResourceType[] = [];
      for (const resource in ResourceType) {
        if (victimResources[resource] > 0) {
          possibleResourceStolen.push(resource as ResourceType);
        }
      }

      console.log(
        "possibleResourceStolen",
        possibleResourceStolen,
        possibleResourceStolen.length
      );

      const theft: Theft = {
        who: {
          victim: action.payload.victim,
          stealer: action.payload.stealer,
        },
        what: possibleResourceStolen,
      };

      //One or nothing thing can be stolen
      if (possibleResourceStolen.length <= 1) {
        console.log("less than or equal to one");
        possibleResourceStolen.forEach((resource) => {
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
    default:
      return state;
  }
};
