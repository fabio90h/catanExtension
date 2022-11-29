import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/index.";
import keywords from "../../../utils/keywords";

export const parseDiscardMessage = (
    node: HTMLElement,
    dispatch: React.Dispatch<Action>
  ) => {
    if (!node.textContent?.includes(keywords.discardedSnippet)) return false;
    if (node.textContent) {
      const player = node.textContent.split(" ")[0];
      const subtractResources = parseResourceImage(node);
  
      dispatch({
        type: ActionType.SUBTRACT_RESOURCES,
        payload: { user: player, subtractResources },
      });
  
      //Review steals
      dispatch({
        type: ActionType.REVIEW_STEALS,
        payload: { player },
      });
    }
  };