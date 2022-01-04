import { Action, ActionType } from "../reducer";
import { ResourceType } from "../types";
import { parsePurchaseImage, parseResourceImage } from "../utils/index.";
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
    const player = node.textContent
      .replace(keywords.receivedResourcesSnippet, "")
      .split(" ")[0];

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
    const player = node.textContent.split(" ")[0];

    const purchase = parsePurchaseImage(node);

    if (!purchase) return false;
    dispatch({
      type: ActionType.PURCHASE,
      payload: { user: player, purchase },
    });
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

    const player = node.textContent
      .replace(keywords.placeInitialSettlementSnippet, "")
      .split(" ")[0];

    const startingResources = parseResourceImage(node);

    dispatch({
      type: ActionType.INITIALIZE_USER,
      payload: { user: player, color: node.style.color, startingResources },
    });
  }
};
