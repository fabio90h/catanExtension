import { Action } from "../../../../reducer";
import { parseDiscardMessage } from "../../../../scripts/actions/parseDiscardMessage/parseDiscardMessage.action";
import { ResourceType } from "../../../../types";
import { discardCardsNode } from "./discardCards.node.simulator";

export const discardCards = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  discardedResources: ResourceType[]
) => {
  parseDiscardMessage(
    discardCardsNode(player, color, discardedResources),
    dispatch
  );
};
