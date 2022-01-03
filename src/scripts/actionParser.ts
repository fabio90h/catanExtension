import { Action, ActionType } from "../reducer";
import { parseImage } from "../utils/index.";
import keywords from "../utils/keywords";

export const parseGot = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.receivedResourcesSnippet)) return;
  if (node.textContent) {
    const player = node.textContent
      .replace(keywords.receivedResourcesSnippet, "")
      .split(" ")[0];

    const addResources = parseImage(node);

    dispatch({
      type: ActionType.ADD_RESOURCE,
      payload: { user: player, addResources },
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

    const startingResources = parseImage(node);

    dispatch({
      type: ActionType.INITIALIZE_USER,
      payload: { user: player, color: node.style.color, startingResources },
    });
  }
};
