import { Action, ActionType } from "../../../reducer";
import { parseExchangeImages } from "../../../utils/helpers/general/parseExchangeImages/parseExchangeImages.general";
import keywords from "../../../utils/keywords";

export const parseBankTrade = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.tradeBankGaveSnippet)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0]; //TODO: creates a helper function here?

    const trade = parseExchangeImages(
      node,
      keywords.tradeBankGaveSnippet,
      keywords.tradeBankTookSnippet
    );

    //TODO: Figure out what type of port the player has based on the trades with the bank

    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: player, addResources: trade.tookResources },
    });
    dispatch({
      type: ActionType.SUBTRACT_RESOURCES,
      payload: { user: player, subtractResources: trade.gaveResources },
    });

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player },
    });
  }
};
