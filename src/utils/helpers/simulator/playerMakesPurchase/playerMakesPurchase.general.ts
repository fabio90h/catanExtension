import { Action } from "../../../../reducer";
import { parsePurchase } from "../../../../scripts/actions/parsePurchase/parsePurchase.actions";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { PurchaseType } from "../../../../types";
import keywords from "../../../keywords";

/**
 * Simulate a player making a purchase with resources
 * @param dispatch
 * @param user
 * @param purchaseType
 * @param color
 */
export const playerMakesPurchase = (
  dispatch: React.Dispatch<Action>,
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

  parsePurchase(node, dispatch);
};
