export enum ResourceType {
  WOOD = "WOOD",
  BRICK = "BRICK",
  SHEEP = "SHEEP",
  STONE = "STONE",
  WHEAT = "WHEAT",
}

export enum PurchaseType {
  ROAD = "ROAD",
  SETTLEMENT = "SETTLEMENT",
  CITY = "CITY",
  DEVELOPMENT = "DEVELOPMENT",
}

export type UserResources = Record<ResourceType, number>;
export type UserConfig = { color: string };

export type Users = Record<
  string,
  {
    resources: UserResources;
    config: UserConfig;
  }
>;
