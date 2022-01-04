import React from "react";
import { PurchaseType, ResourceType, Users } from "./types";
import { checkForUserExistance } from "./utils/index.";

export enum ActionType {
  PURCHASE = "PURCHASE",
  ADD_RESOURCE = "ADD_RESOURCE",
  SUBTRACT_RESOURCE = "SUBTRACT_RESOURCE",
  INITIALIZE_USER = "INITIALIZE_USER",
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
      type: ActionType.ADD_RESOURCE;
      payload: { user: string; addResources: ResourceType[] };
    }
  | {
      type: ActionType.SUBTRACT_RESOURCE;
      payload: { user: string; subtractResources: ResourceType[] };
    }
  | {
      type: ActionType.PURCHASE;
      payload: { user: string; purchase: PurchaseType };
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
    case ActionType.ADD_RESOURCE: {
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
    case ActionType.SUBTRACT_RESOURCE: {
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
    default:
      return state;
  }
};
