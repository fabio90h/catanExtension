import keywords from "../../../keywords";
import { createDivElement } from "../../general/createDivElement/createDivElement.general";

export const unknownStealNode = (
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

  return node;
};
