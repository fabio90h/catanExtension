import { ResourceType, PurchaseType } from "../types";
import keywords from "../utils/keywords";

export default {
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
