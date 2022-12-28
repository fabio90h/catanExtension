import { Action, ActionType } from "../../../reducer";
import { parseExchangeImages } from "../../../utils/helpers/general/parseExchangeImages/parseExchangeImages.general";
import keywords from "../../../utils/keywords";

export const parseProposalMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.proposal)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];

    const { gaveResources: offeredResources, tookResources: wantedResources } =
      parseExchangeImages(node, keywords.proposal, keywords.wants);

    //TODO: Figure out what the player is trying to build with this offer. Consider ports as well

    // Resolve or reduce thefts based on offers
    dispatch({
      type: ActionType.RESOLVE_UNKNOWN_STEAL_WITH_OFFERS,
      payload: { player, offeredResources, wantedResources },
    });

    //Review steals to see if any can be resolved with the offer resolution.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player },
    });
  }
};
