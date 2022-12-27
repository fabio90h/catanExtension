import { createDivElement } from "../../../../tests/utils";
import keywords from "../../../keywords";

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
