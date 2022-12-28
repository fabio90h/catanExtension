import { ResourceType, PurchaseType, UserProperties } from "../types";
import keywords from "./keywords";

// Gives the necessary data to inform who is playing
// what are the resources available and how much
// things cost.
export const testData = {
  resources: [
    ResourceType.WOOD,
    ResourceType.WHEAT,
    ResourceType.BRICK,
    ResourceType.SHEEP,
    ResourceType.STONE,
  ],
  users: [keywords.userName, "Alex", "Gali", "Kelvin"],
  purchase: {
    [PurchaseType.ROAD]: [ResourceType.WOOD, ResourceType.BRICK],
    [PurchaseType.SETTLEMENT]: [
      ResourceType.WOOD,
      ResourceType.BRICK,
      ResourceType.WHEAT,
      ResourceType.SHEEP,
    ],
    [PurchaseType.CITY]: [
      ResourceType.WHEAT,
      ResourceType.WHEAT,
      ResourceType.STONE,
      ResourceType.STONE,
      ResourceType.STONE,
    ],
    [PurchaseType.DEVELOPMENT]: [
      ResourceType.WHEAT,
      ResourceType.STONE,
      ResourceType.SHEEP,
    ],
  },
};

/**
 * Reset all resources to zero
 */
export const emptyResources = {
  [ResourceType.WOOD]: 0,
  [ResourceType.WHEAT]: 0,
  [ResourceType.BRICK]: 0,
  [ResourceType.SHEEP]: 0,
  [ResourceType.STONE]: 0,
};

/**
 * Different variations on color and starting resources for players
 */
export const startingResourcesAndConfig: UserProperties[] = [
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 2,
    },
    config: { color: "rgb(224, 151, 66)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 1,
      [ResourceType.SHEEP]: 1,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(102, 102, 102)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 2,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(226, 113, 116)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 2,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(34, 54, 151)" },
  },
];
