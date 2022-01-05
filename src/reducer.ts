import React from "react";
import { PurchaseType, ResourceType, Users } from "./types";
import { checkForUserExistance } from "./utils/index.";

export enum ActionType {
  PURCHASE = "PURCHASE",
  ADD_RESOURCES = "ADD_RESOURCES",
  SUBTRACT_RESOURCES = "SUBTRACT_RESOURCES",
  INITIALIZE_USER = "INITIALIZE_USER",
  STEAL_ALL = "STEAL_ALL",
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
    };

export const reducer: React.Reducer<Users, Action> = (state, action) => {
  switch (action.type) {
    case ActionType.INITIALIZE_USER: {
      const resources = {
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
        [action.payload.user]: {
          resources,
          config: { color: action.payload.color },
        },
      };
    }
    case ActionType.ADD_RESOURCES: {
      checkForUserExistance(action.payload.user, state);

      const tempResource = { ...state[action.payload.user].resources };
      const tempConfig = { ...state[action.payload.user].config };

      action.payload.addResources.forEach(
        (resource) => (tempResource[resource] += 1)
      );

      return {
        ...state,
        [action.payload.user]: {
          resources: tempResource,
          config: tempConfig,
        },
      };
    }
    case ActionType.SUBTRACT_RESOURCES: {
      checkForUserExistance(action.payload.user, state);

      const tempResource = { ...state[action.payload.user].resources };
      const tempConfig = { ...state[action.payload.user].config };

      action.payload.subtractResources.forEach(
        (resource) => (tempResource[resource] -= 1)
      );

      return {
        ...state,
        [action.payload.user]: {
          resources: tempResource,
          config: tempConfig,
        },
      };
    }
    case ActionType.PURCHASE: {
      checkForUserExistance(action.payload.user, state);

      const tempResource = { ...state[action.payload.user].resources };
      const tempConfig = { ...state[action.payload.user].config };

      switch (action.payload.purchase) {
        case PurchaseType.CITY: {
          tempResource[ResourceType.WHEAT] -= 2;
          tempResource[ResourceType.STONE] -= 3;
          break;
        }
        case PurchaseType.ROAD: {
          tempResource[ResourceType.WOOD] -= 1;
          tempResource[ResourceType.BRICK] -= 1;
          break;
        }
        case PurchaseType.SETTLEMENT: {
          tempResource[ResourceType.WOOD] -= 1;
          tempResource[ResourceType.BRICK] -= 1;
          tempResource[ResourceType.WHEAT] -= 1;
          tempResource[ResourceType.SHEEP] -= 1;
          break;
        }
        case PurchaseType.DEVELOPMENT: {
          tempResource[ResourceType.STONE] -= 1;
          tempResource[ResourceType.WHEAT] -= 1;
          tempResource[ResourceType.SHEEP] -= 1;
          break;
        }
      }

      return {
        ...state,
        [action.payload.user]: {
          resources: tempResource,
          config: tempConfig,
        },
      };
    }
    case ActionType.STEAL_ALL: {
      checkForUserExistance(action.payload.user, state);
      const users = { ...state };

      const tempResource = { ...users[action.payload.user].resources };
      const tempConfig = { ...users[action.payload.user].config };

      //Remove resource from each player
      Object.keys(state).forEach((player) => {
        if (player !== action.payload.user)
          users[player].resources[action.payload.stolenResource] = 0;
      });

      //Add the stolen resources to the player
      tempResource[action.payload.stolenResource] = action.payload.stoleAmount;

      return {
        ...users,
        [action.payload.user]: {
          resources: tempResource,
          config: tempConfig,
        },
      };
    }
    default:
      return state;
  }
};
