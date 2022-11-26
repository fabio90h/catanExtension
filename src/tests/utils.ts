import {
  PurchaseType,
  ResourceType,
  UserConfig,
  UserResources,
  Users,
} from "../types";
import { getImg } from "../utils/index.";

import testData from "../utils/data";

type UserProperties = {
  resources: UserResources;
  config: UserConfig;
};

/**
 * Different variations on color and starting resources for players
 */
const startingResourcesAndConfig: UserProperties[] = [
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

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const getRandomArbitrary = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

/**
 * Suffles array
 * TODO: Can be refactored
 */
export const shuffleArray = <T>(array: Array<T>) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const getRandomResources = (amount: number = 9) => {
  const gainedResources: ResourceType[] = [];
  const resourceAmount = getRandomArbitrary(1, amount);
  for (let i = 0; i < resourceAmount; i++) {
    const randomIndex = getRandomArbitrary(0, testData.resources.length);
    gainedResources.push(testData.resources[randomIndex]);
  }

  return gainedResources;
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
 * Create Player with config and the starting resources
 * @param allResourceStartEmpty if we want to assign emptry resource to all players
 * @returns
 */
export const createPlayersAndProperties = (
  allResourceStartEmpty: boolean = false
) => {
  const shuffledStartingResourcesAndConfig = shuffleArray<UserProperties>(
    startingResourcesAndConfig
  );
  return testData.users.reduce<Users>((acc, user, index) => {
    // Assign shuffle amount of resource to player
    acc[user] = shuffledStartingResourcesAndConfig[index];
    // Remove all resources from player if allResourceStartEmpty is true
    if (allResourceStartEmpty) {
      acc[user].resources = emptyResources;
    }
    return acc;
  }, {});
};

/**
 * Simulates the output of each log
 * @param color
 * @param user1
 * @param keywords
 * @param user2
 * @returns
 */
export const createDivElement = (
  color: string,
  user1: string,
  keywords: string,
  user2?: string
) => {
  const node = document.createElement("div");
  node.textContent = `${user1} ${keywords} ${user2 ? user2 : ""}`;
  node.style.color = color;
  return node;
};

/**
 * Creates the card image that we see in the game log
 * @param node
 * @param imageType
 * @returns
 */
export const createChildImgElement = (
  node: HTMLElement,
  imageType: ResourceType | PurchaseType
) => {
  const img = document.createElement("img");
  img.setAttribute("src", getImg(imageType));
  node.appendChild(img);
  return node;
};

/**
 * Counts the total amount of a specific type that is found in an array
 * @param arrayWithType
 * @param typeToBeCounted
 * @returns
 */
export const countTotalTypeInArray = <T>(
  arrayWithType: T[],
  typeToBeCounted: T
) => {
  return arrayWithType.reduce(
    (acc, type) => (typeToBeCounted === type ? acc + 1 : acc),
    0
  );
};
