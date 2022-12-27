import { Action } from "../../../../reducer";
import { parsePlayersTrade } from "../../../../scripts/actions/parsePlayerTrade/parsePlayerTrade.actions";
import { ResourceType } from "../../../../types";
import { offerProposal } from "../offerProposal";
import { playerTradeNode } from "./playerTrade.node.simulator";

/**
 * Simulates a player accepting a trade offer
 * @param dispatch
 * @param offeringPlayer
 * @param agreedPlayer
 * @param gave
 * @param took
 * @param color
 */
export const playerTrade = (
  dispatch: React.Dispatch<Action>,
  offeringPlayer: string,
  agreedPlayer: string,
  gave: ResourceType[],
  took: ResourceType[],
  color: string
) => {
  offerProposal(dispatch, offeringPlayer, gave, took, color);

  parsePlayersTrade(
    playerTradeNode(offeringPlayer, agreedPlayer, gave, took, color),
    dispatch
  );
};
