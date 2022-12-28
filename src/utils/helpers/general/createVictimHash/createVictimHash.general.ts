import { Theft, Victim } from "../../../../types";
import { createKeyForHash } from "../createKeyForHash/createKeyForHash.general";

/**
 * Creates a has with unique key to summarize each thefts.
 * Eg [victim_stealer-resource1_resource2]: {reoccurrence: 1, resourceAmount: 3}
 * @param thefts
 * @returns
 */
export function createVictimHash(thefts: Theft[]) {
  return thefts.reduce<Record<string, Victim>>((acc, theft) => {
    const resourceAmount = Object.keys(theft.what).length;

    const key = createKeyForHash(
      theft.who.victim,
      theft.who.stealer,
      theft.what
    );

    if (!!acc[key]) {
      acc[key].reoccurrence = acc[key].reoccurrence + 1;
      return acc;
    }
    return {
      ...acc,
      [key]: {
        reoccurrence: 1,
        resourceAmount,
      },
    };
  }, {});
}
