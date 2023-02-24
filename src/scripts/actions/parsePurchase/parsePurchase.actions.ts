import { Action, ActionType } from "../../../reducer";
import { testData } from "../../../utils/data";
import { parsePurchaseImage } from "../../../utils/helpers/general/parsePurchaseImage/parsePurchaseImage.general";
import keywords from "../../../utils/keywords";

/**
 * Purchase includes building or buying a development card
 * @param node
 * @param dispatch
 * @returns
 */
export const parsePurchase = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (
    !node.textContent?.includes(keywords.builtSnippet) &&
    !node.textContent?.includes(keywords.boughtSnippet)
  )
    return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0]; //TODO: creates a helper function here?

    const purchase = parsePurchaseImage(node);

    if (!purchase) return false;

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS_WITH_ACTION,
      payload: { player, actionWithResources: testData.purchase[purchase] },
    });

    dispatch({
      type: ActionType.PURCHASE,
      payload: { user: player, purchase },
    });
  }
};
