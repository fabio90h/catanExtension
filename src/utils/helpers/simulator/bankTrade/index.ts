import { Action } from "../../../../reducer";
import { parseBankTrade } from "../../../../scripts/actions/parseBankTrade/parseBankTrade.action";

import { ResourceType } from "../../../../types";
import { bankTradeNode } from "./bankTrade.node.simulator";

/**
 * Simulate a player making a trade with the bank
 * @param dispatch
 * @param user
 * @param gave
 * @param took
 * @param color
 */
export const bankTrade = (
  dispatch: React.Dispatch<Action>,
  user: string,
  gave: ResourceType[],
  took: ResourceType[],
  color: string
) => {
  parseBankTrade(bankTradeNode(user, gave, took, color), dispatch);
};
