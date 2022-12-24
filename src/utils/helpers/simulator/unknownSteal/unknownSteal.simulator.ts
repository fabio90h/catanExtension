import { Action } from "../../../../reducer";
import { parseStoleUnknownMessage } from "../../../../scripts/actions/parseStoleUnknownMessage/parseStoleUnknownMessage.action";
import { createDivElement } from "../../../../tests/utils";
import keywords from "../../../keywords";

export const unknownSteal = (
  dispatch: React.Dispatch<Action>,
  victim: string,
  stealer: string,
  color: string
) => {
  const node = createDivElement(
    color,
    stealer,
    `${keywords.stoleFromSnippet}`,
    victim
  );

  parseStoleUnknownMessage(node, dispatch);
};
