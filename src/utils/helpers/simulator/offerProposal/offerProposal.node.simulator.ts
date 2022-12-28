import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { createChildImgElement } from "../../general/createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../../general/createDivElement/createDivElement.general";

/**
 * Simulate a player making a trade offer
 * @param dispatch
 * @param offeringPlayer
 * @param offer
 * @param want
 * @param color
 */
export const offerProposalNode = (
  offeringPlayer: string,
  offer: ResourceType[],
  want: ResourceType[],
  color: string
) => {
  const node = createDivElement(color, offeringPlayer, keywords.proposal);

  offer.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeEnd = document.createTextNode(keywords.wants);
  node.appendChild(textNodeEnd);

  want.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  return node;
};
