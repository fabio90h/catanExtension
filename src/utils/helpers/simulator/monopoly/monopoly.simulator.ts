import { Action } from "../../../../reducer";
import { parseMonopolyCard } from "../../../../scripts/actions/parseMonopolyCard/parseMonopolyCard.action";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

/**
 * Simulates a player playing the monopoly card
 * @param dispatch
 * @param player
 * @param color
 * @param monopolizedResource
 * @param amountStolen
 */
export const monopoly = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  monopolizedResource: ResourceType,
  amountStolen: number
) => {
  const prevNode = createDivElement(color, player, keywords.stoleAllOfSnippet);

  const node = createDivElement(color, player, keywords.monoplyStole);

  createChildImgElement(node, monopolizedResource);

  const textNodeAgree = document.createTextNode(` ${amountStolen}`);
  node.appendChild(textNodeAgree);

  parseMonopolyCard(node, prevNode, dispatch);
};
