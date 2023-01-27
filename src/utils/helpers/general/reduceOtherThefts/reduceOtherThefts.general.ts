import { Theft, ResourceType } from "../../../../types";

/**
 * Use this function to reduce the probability that other resources got stole.
 * For example, say we have to following:
 * 
 * [
        {
            who: { stealer: "Kelvin", victim: "Alex" },
            what: { [ResourceType.WHEAT]: 1, [ResourceType.BRICK]: 1, [ResourceType.SHEEP]: 1, },
        },
        {
            who: { stealer: "Kelvin", victim: "Alex" },
            what: { [ResourceType.WHEAT]: 1, [ResourceType.BRICK]: 1, [ResourceType.SHEEP]: 1 },
        },
        {
            who: { stealer: "Alex", victim: "Gali" },
            what: {
                [ResourceType.STONE]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.WHEAT]: 1,
            },
        },
    ];
 * 
 * Lets say that Alex offered a BRICK then we know that kelvin did not
 * steal BRICKs and we can eliminate that from the theft possibilities.
 * @param thefts 
 * @param victim 
 * @param knownResource 
 * @returns 
 */
export function reduceOtherThefts(
  thefts: Theft[],
  victim: string,
  knownResource: ResourceType
) {
  for (let i = thefts.length - 1; i >= 0; i--) {
    if (thefts[i].who.victim === victim && thefts[i].what[knownResource]) {
      // If the victim only has one resources at hand when he was stolen than remove
      // this resource stolen possibility
      if (thefts[i].what[knownResource] === 1) {
        delete thefts[i].what[knownResource];
      }
      // Reduced the steal possibilities.
      // NOTE: not too sure why it needs a ! here since we are doing the check above.
      else {
        thefts[i].what[knownResource]!--;
      }
    }
  }
  return thefts;
}
