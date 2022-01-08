export enum ResourceType {
  WOOD = "WOOD",
  BRICK = "BRICK",
  SHEEP = "SHEEP",
  STONE = "STONE",
  WHEAT = "WHEAT",
}

export enum UnknownType {
  UNKOWN = "UNKNOWN",
}

export enum PurchaseType {
  ROAD = "ROAD",
  SETTLEMENT = "SETTLEMENT",
  CITY = "CITY",
  DEVELOPMENT = "DEVELOPMENT",
}

export type Theft = {
  who: { stealer: string; victim: string };
  what: ResourceType[];
};

export type UserResources = Record<ResourceType, number>;
export type UserConfig = { color: string };

export type Users = Record<
  string,
  {
    resources: UserResources;
    config: UserConfig;
  }
>;

export type ImageType = PurchaseType | ResourceType | UnknownType;

export type GameData = { users: Users; thefts: Theft[] };
