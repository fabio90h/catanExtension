import { ResourceType } from "../../../../types";
import { testData } from "../../../data";

/**
 * Gives a random ResourceType array
 * e.g. [ResourceType.WOOD, ResourceType.WHEAT]
 * @param maxRange
 * @returns
 */
export const getRandomResources = (maxRange: number = 9) => {
  const gainedResources: ResourceType[] = [];
  const resourceAmount = getRandomArbitrary(1, maxRange);
  for (let i = 0; i <= resourceAmount; i++) {
    const randomIndex = getRandomArbitrary(0, testData.resources.length);
    gainedResources.push(testData.resources[randomIndex]);
  }

  return gainedResources;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const getRandomArbitrary = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
