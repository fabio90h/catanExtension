import React from "react";
import { ResourceType, Users } from "./types";

export enum ActionType {
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
      payload: { user: string; resourceType: ResourceType };
    }
  | {
      type: ActionType.SUBTRACT_RESOURCE;
      payload: { user: string; resourceType: ResourceType };
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
      return {
        ...state,
        [action.payload.user]: {
          ...state[action.payload.user],
          [action.payload.resourceType]:
            state[action.payload.user].resources[action.payload.resourceType] +
              1 || 0,
        },
      };
    }
    case ActionType.SUBTRACT_RESOURCE: {
      return {
        ...state,
        [action.payload.user]: {
          ...state[action.payload.user],
          [action.payload.resourceType]:
            state[action.payload.user].resources[action.payload.resourceType] -
              1 || 0,
        },
      };
    }
    default:
      return state;
  }
};
