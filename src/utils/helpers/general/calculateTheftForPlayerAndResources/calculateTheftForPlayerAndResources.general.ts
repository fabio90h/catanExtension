import { ResourceType, Theft } from "../../../../types";

/**
 * Calculate the total sum of lost and gain of resource for a given player.
 * i.e. if 1 resource was potentially stolen but also potentially stole, return 0.
 */
export function calculateTheftForPlayerAndResources(
  player: string,
  resourceType: ResourceType,
  thefts: Theft[]
) {
  const total = thefts.reduce((acc, theft) => {
    if (theft.who.stealer === player) {
      return acc + (theft.what[resourceType] ? 1 : 0);
    }
    if (theft.who.victim === player) {
      return acc - (theft.what[resourceType] ? 1 : 0);
    }
    return acc;
  }, 0);
  return total;
}
