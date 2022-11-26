import { Action, ActionType } from "../../../reducer";
import { parseExchangeImages } from "../../../utils/index.";
import keywords from "../../../utils/keywords";

export const parsePurposalMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.proposal)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];

    const { gaveResources: offeredResources, tookResources: wantedResources } =
      parseExchangeImages(node, keywords.proposal, keywords.wants);

    //TODO: Figure out what the player is trying to build with this offer. Consider ports as well

    dispatch({
      type: ActionType.RESOLVE_UNKNOWN_STEAL_WITH_OFFERS,
      payload: { player, offeredResources, wantedResources },
    });
  }
};
