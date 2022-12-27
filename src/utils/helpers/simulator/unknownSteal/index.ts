import { Action } from "../../../../reducer";
import { parseStoleUnknownMessage } from "../../../../scripts/actions/parseStoleUnknownMessage/parseStoleUnknownMessage.action";
import { unknownStealNode } from "./unknownSteal.node.simulator";

export const unknownSteal = (
  dispatch: React.Dispatch<Action>,
  victim: string,
  stealer: string,
  color: string
) => {
  parseStoleUnknownMessage(unknownStealNode(victim, stealer, color), dispatch);
};
