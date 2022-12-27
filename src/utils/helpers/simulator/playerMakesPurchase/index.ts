import { Action } from "../../../../reducer";
import { parsePurchase } from "../../../../scripts/actions/parsePurchase/parsePurchase.actions";
import { PurchaseType } from "../../../../types";
import { playerMakesPurchaseNode } from "./playerMakesPurchase.node.simulator";

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
  parsePurchase(playerMakesPurchaseNode(user, purchaseType, color), dispatch);
};
