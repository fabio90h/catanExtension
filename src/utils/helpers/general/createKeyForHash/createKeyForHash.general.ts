import { UserResources } from "../../../../types";

/**
 * Creates a unique key such as Kelvin_Alex:WOOD_WHEAT_SHEEP
 * @param victim string
 * @param stealer string
 * @param possibleStolenResources ResourceType[]
 * @returns
 */
export function createKeyForHash(
  victim: string,
  stealer: string,
  possibleStolenResources: Partial<UserResources>
) {
  return `${victim}_${stealer}:${Object.keys(possibleStolenResources).join(
    "_"
  )}`;
}
