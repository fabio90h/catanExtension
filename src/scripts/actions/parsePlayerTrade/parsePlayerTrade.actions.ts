import { Action, ActionType } from "../../../reducer";
import { exchangeResources } from "../../../utils/helpers/general/exchangeResources/exchangeResources.general";
import { parseExchangeImages } from "../../../utils/helpers/general/parseExchangeImages/parseExchangeImages.general";
import keywords from "../../../utils/keywords";

export const parsePlayersTrade = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.tradedWithSnippet)) return false;
  if (node.textContent) {
    const textContentArray = node.textContent.split(" ");

    const offeringPlayer = textContentArray[0];
    const agreedPlayer = textContentArray[textContentArray.length - 1];

    const trade = parseExchangeImages(
      node,
      keywords.tradedWithSnippet,
      keywords.tradeEnd
    );
    // OfferingPlayer's resources are sent to agreedPlayer
    exchangeResources(
      dispatch,
      offeringPlayer,
      agreedPlayer,
      trade.gaveResources
    );
    // AgreedPlayer's resources are sent to offeringPlayer
    exchangeResources(
      dispatch,
      agreedPlayer,
      offeringPlayer,
      trade.tookResources
    );

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player: agreedPlayer },
    });
  }
};
