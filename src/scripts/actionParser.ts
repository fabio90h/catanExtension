import { Action, ActionType } from "../reducer";
import { ResourceType } from "../types";
import {
  exchangeResources,
  parseExchangeImages,
  parsePurchaseImage,
  parseResourceImage,
} from "../utils/index.";
import keywords from "../utils/keywords";

/**
 * Parse the Got log message to figure out what resource the player received
 * @param node
 * @param dispatch
 * @returns
 */
export const parseGot = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.receivedResourcesSnippet))
    return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];

    const addResources = parseResourceImage(node) as ResourceType[];

    dispatch({
      type: ActionType.ADD_RESOURCE,
      payload: { user: player, addResources },
    });

    return true;
  }
};

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
    !node.textContent?.includes(keywords.builtSnippet) ||
    !node.textContent?.includes(keywords.boughtSnippet)
  )
    return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0]; //TODO: creates a helper function here?

    const purchase = parsePurchaseImage(node);

    if (!purchase) return false;
    dispatch({
      type: ActionType.PURCHASE,
      payload: { user: player, purchase },
    });
  }
};

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

    exchangeResources(
      dispatch,
      offeringPlayer,
      trade.gaveResources,
      trade.tookResources
    );
    exchangeResources(
      dispatch,
      agreedPlayer,
      trade.tookResources,
      trade.gaveResources
    );
  }
};

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
    exchangeResources(
      dispatch,
      player,
      trade.gaveResources,
      trade.tookResources
    );
  }
};

/**
 * Once initial settlements are placed, determine the players.
 */
export const recognizeUsers = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.placeInitialSettlementSnippet))
    return;
  if (node.textContent) {
    console.log("recognizeUsers", node);

    const player = node.textContent.split(" ")[0];

    const startingResources = parseResourceImage(node);

    dispatch({
      type: ActionType.INITIALIZE_USER,
      payload: { user: player, color: node.style.color, startingResources },
    });
  }
};
