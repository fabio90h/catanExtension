import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/index.";
import keywords from "../../../utils/keywords";

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

    const addResources = parseResourceImage(node);

    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: player, addResources },
    });

    return true;
  }
};
