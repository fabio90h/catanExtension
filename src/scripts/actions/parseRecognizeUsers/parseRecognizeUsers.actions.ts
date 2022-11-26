import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/index.";
import keywords from "../../../utils/keywords";

/**
 * Once initial settlements are placed, determine the players.
 */
 export const parseRecognizeUsers = (
    node: HTMLElement,
    dispatch: React.Dispatch<Action>
  ) => {
    if (!node.textContent?.includes(keywords.placeInitialSettlementSnippet))
      return;
    if (node.textContent) {
      const player = node.textContent.split(" ")[0];
  
      const startingResources = parseResourceImage(node);
  
      dispatch({
        type: ActionType.INITIALIZE_USER,
        payload: { user: player, color: node.style.color, startingResources },
      });
    }
  };
  