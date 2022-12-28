import { Action } from "../../../../reducer";
import { parseProposalMessage } from "../../../../scripts/actions/parseProposalMessage/parseProposalMessage.action";
import { ResourceType } from "../../../../types";
import { offerProposalNode } from "./offerProposal.node.simulator";

/**
 * Simulate a player making a trade offer
 * @param dispatch
 * @param offeringPlayer
 * @param offer
 * @param want
 * @param color
 */
export const offerProposal = (
  dispatch: React.Dispatch<Action>,
  offeringPlayer: string,
  offer: ResourceType[],
  want: ResourceType[],
  color: string
) => {
  parseProposalMessage(
    offerProposalNode(offeringPlayer, offer, want, color),
    dispatch
  );
};
