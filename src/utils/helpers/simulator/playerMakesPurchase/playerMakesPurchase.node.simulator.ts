import { PurchaseType } from "../../../../types";
import keywords from "../../../keywords";
import { createChildImgElement } from "../../general/createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../../general/createDivElement/createDivElement.general";

/**
 * Simulate a player making a purchase with resources
 * @param dispatch
 * @param user
 * @param purchaseType
 * @param color
 */
export const playerMakesPurchaseNode = (
  user: string,
  purchaseType: PurchaseType,
  color: string
) => {
  const node = createDivElement(
    color,
    user,
    purchaseType === PurchaseType.DEVELOPMENT
      ? keywords.boughtSnippet
      : keywords.builtSnippet
  );

  createChildImgElement(node, purchaseType);

  return node;
};
