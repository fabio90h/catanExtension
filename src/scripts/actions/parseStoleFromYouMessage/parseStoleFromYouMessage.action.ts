import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/helpers/general/parseResourceImage/parseResourceImage.general";

import keywords from "../../../utils/keywords";

export const parseStoleFromYouMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  const isStolenFromYou = nodeText?.includes(keywords.stoleFromYouSnippet);
  const youStoleFrom = nodeText?.includes(keywords.youStoleFromSnippet);
  if (!isStolenFromYou && !youStoleFrom) {
    return false;
  }
  if (nodeText) {
    const nodeTextArray = nodeText.split(" ");
    let stealer = nodeTextArray[0];
    let victim = nodeTextArray[nodeTextArray.length - 1];

    let isUserAStealer = false;
    if (stealer.toLocaleLowerCase() === "you") isUserAStealer = true;

    const stolenResource = parseResourceImage(node);
    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: {
        user: stealer,
        addResources: stolenResource,
        isUser: isUserAStealer,
      },
    });
    dispatch({
      type: ActionType.SUBTRACT_RESOURCES,
      payload: {
        user: victim,
        subtractResources: stolenResource,
        isUser: !isUserAStealer,
      },
    });

    //Review steals
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: {
        player: stealer.toLocaleLowerCase() === "you" ? victim : stealer,
      },
    });
  }
};
