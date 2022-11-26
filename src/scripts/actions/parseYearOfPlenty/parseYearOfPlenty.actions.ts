import { Action, ActionType } from "../../../reducer";
import { parseResourceImage } from "../../../utils/index.";
import keywords from "../../../utils/keywords";

export const parseYearOfPlenty = (
    node: HTMLElement,
    dispatch: React.Dispatch<Action>
  ) => {
    if (!node.textContent?.includes(keywords.yearOfPlenty)) return false;
    if (node.textContent) {
      const player = node.textContent.split(" ")[0];
      const addResources = parseResourceImage(node);
  
      dispatch({
        type: ActionType.ADD_RESOURCES,
        payload: { user: player, addResources },
      });
    }
  };
  