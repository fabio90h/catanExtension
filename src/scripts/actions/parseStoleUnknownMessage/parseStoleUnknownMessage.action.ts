import { Action, ActionType } from "../../../reducer";
import keywords from "../../../utils/keywords";

export const parseStoleUnknownMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  if (!nodeText?.includes(keywords.stoleFromSnippet)) return false;
  if (nodeText) {
    const nodeTextArray = nodeText.split(" ");
    const stealer = nodeTextArray[0];
    const victim = nodeTextArray[nodeTextArray.length - 1];

    dispatch({ type: ActionType.UNKNOWN_STEAL, payload: { stealer, victim } });
  }
};
