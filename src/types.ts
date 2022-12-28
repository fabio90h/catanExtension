export enum ResourceType {
  WOOD = "WOOD",
  BRICK = "BRICK",
  SHEEP = "SHEEP",
  STONE = "STONE",
  WHEAT = "WHEAT",
}

export enum UnknownType {
  UNKNOWN = "UNKNOWN",
}

export enum PurchaseType {
  ROAD = "ROAD",
  SETTLEMENT = "SETTLEMENT",
  CITY = "CITY",
  DEVELOPMENT = "DEVELOPMENT",
}

export type Theft = {
  who: { stealer: string; victim: string };
  what: Partial<UserResources>;
};

export type UserResources = Record<ResourceType, number>;
export type UserConfig = { color: string };

export type Users = Record<string, UserProperties>;
export type ImageType = PurchaseType | ResourceType | UnknownType;

export type GameData = { users: Users; thefts: Theft[] };

export type Victim = {
  resourceAmount: number;
  reoccurrence: number;
};

export type UserProperties = {
  resources: UserResources;
  config: UserConfig;
};
