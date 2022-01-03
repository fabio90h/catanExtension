import { Action, ActionType } from "../reducer";
import { ResourceType } from "../types";
import { parseBuildImage, parseResourceImage } from "../utils/index.";
import keywords from "../utils/keywords";

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

export const parseBuild = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.builtSnippet)) return false;
  if (node.textContent) {
    const player = node.textContent
      .replace(keywords.receivedResourcesSnippet, "")
      .split(" ")[0];

    const build = parseBuildImage(node);
    console.log("build", build, node.textContent);

    if (build) {
      dispatch({
        type: ActionType.BUILD,
        payload: { user: player, build },
      });
    }
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
