import { Action } from "../../../../reducer";
import { parseMonopolyCard } from "../../../../scripts/actions/parseMonopolyCard/parseMonopolyCard.action";
import { ResourceType } from "../../../../types";
import { monopolyNode } from "./monopoly.node.simulator";

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
  const [prevNode, node] = monopolyNode(
    player,
    color,
    monopolizedResource,
    amountStolen
  );

  parseMonopolyCard(node, prevNode, dispatch);
};
