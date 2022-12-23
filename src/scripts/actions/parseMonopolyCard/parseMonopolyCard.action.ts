import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/helpers/general/parseResourceImage/parseResourceImage.general";

import keywords from "../../../utils/keywords";

export const parseMonopolyCard = (
  node: HTMLElement,
  previousNode: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  if (!previousNode.textContent?.includes(keywords.stoleAllOfSnippet))
    return false;
  if (nodeText) {
    const player = nodeText.split(" ")[0];
    const stoleAmount = parseInt(nodeText.split(keywords.monoplyStole)[1]);

    const stolenResource = parseResourceImage(node)[0];

    dispatch({
      type: ActionType.STEAL_ALL,
      payload: {
        user: player,
        stolenResource,
        stoleAmount,
      },
    });
  }
};
