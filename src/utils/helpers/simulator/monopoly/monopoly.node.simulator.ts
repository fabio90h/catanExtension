import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

/**
 * Simulates a player playing the monopoly card
 * @param player
 * @param color
 * @param monopolizedResource
 * @param amountStolen
 */
export const monopolyNode = (
  player: string,
  color: string,
  monopolizedResource: ResourceType,
  amountStolen: number
) => {
  const prevNode = createDivElement(color, player, keywords.stoleAllOfSnippet);

  const node = createDivElement(color, player, keywords.monopolyStole);

  createChildImgElement(node, monopolizedResource);

  const textNodeAgree = document.createTextNode(` ${amountStolen}`);
  node.appendChild(textNodeAgree);

  return [prevNode, node];
};
