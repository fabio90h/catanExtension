import { Action, ActionType } from "../reducer";
import {
  exchangeResources,
  parseExchangeImages,
  parsePurchaseImage,
  parseResourceImage,
} from "../utils/index.";
import keywords from "../utils/keywords";

/**
 * Parse the Got log message to figure out what resource the player received
 * @param node
 * @param dispatch
 * @returns
 */
export const parseGot = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.receivedResourcesSnippet))
    return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];

    const addResources = parseResourceImage(node);

    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: player, addResources },
    });

    return true;
  }
};

/**
 * Purchase includes building or buying a development card
 * @param node
 * @param dispatch
 * @returns
 */
export const parsePurchase = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (
    !node.textContent?.includes(keywords.builtSnippet) &&
    !node.textContent?.includes(keywords.boughtSnippet)
  )
    return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0]; //TODO: creates a helper function here?

    const purchase = parsePurchaseImage(node);

    if (!purchase) return false;

    dispatch({
      type: ActionType.PURCHASE,
      payload: { user: player, purchase },
    });

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player },
    });
  }
};

export const parsePlayersTrade = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.tradedWithSnippet)) return false;
  if (node.textContent) {
    const textContentArray = node.textContent.split(" ");

    const offeringPlayer = textContentArray[0];
    const agreedPlayer = textContentArray[textContentArray.length - 1];

    const trade = parseExchangeImages(
      node,
      keywords.tradedWithSnippet,
      keywords.tradeEnd
    );
    // OfferingPlayer's resources are sent to agreedPlayer
    exchangeResources(
      dispatch,
      offeringPlayer,
      agreedPlayer,
      trade.gaveResources
    );
    // AgreedPlayer's resources are sent to offeringPlayer
    exchangeResources(
      dispatch,
      agreedPlayer,
      offeringPlayer,
      trade.tookResources
    );

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player: agreedPlayer },
    });
  }
};

export const parseBankTrade = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.tradeBankGaveSnippet)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0]; //TODO: creates a helper function here?

    const trade = parseExchangeImages(
      node,
      keywords.tradeBankGaveSnippet,
      keywords.tradeBankTookSnippet
    );

    //TODO: Figure out what type of port the player has based on the trades with the bank

    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: player, addResources: trade.tookResources },
    });
    dispatch({
      type: ActionType.SUBTRACT_RESOURCES,
      payload: { user: player, subtractResources: trade.gaveResources },
    });

    //Review steals to see if any can be resolved with the purchase action.
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player },
    });
  }
};

export const parseMonoplyCard = (
  node: HTMLElement,
  previousNode: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  if (!previousNode.textContent?.includes(keywords.stoleAllOfSnippet))
    return false;
  if (nodeText) {
    const player = nodeText.split(" ")[0];
    const stoleAmount = parseInt(nodeText.split(keywords.monoplyStole)[1]);

    const stolenResources = parseResourceImage(node);

    dispatch({
      type: ActionType.STEAL_ALL,
      payload: {
        user: player,
        stolenResource: stolenResources[0],
        stoleAmount,
      },
    });
  }
};

//NEED TO TEST
export const parseYearofPlenty = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.yearOfPlenty)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];
    const addResources = parseResourceImage(node);

    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: player, addResources },
    });
  }
};

export const parseDiscardedMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.discardedSnippet)) return false;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];
    const subtractResources = parseResourceImage(node);

    dispatch({
      type: ActionType.SUBTRACT_RESOURCES,
      payload: { user: player, subtractResources },
    });

    //Review steals
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player },
    });
  }
};

export const parseStoleFromYouMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  const isStolenFromYou = nodeText?.includes(keywords.stoleFromYouSnippet);
  const youStoleFrom = nodeText?.includes(keywords.youStoleFromSnippet);
  if (!isStolenFromYou && !youStoleFrom) {
    return false;
  }
  if (nodeText) {
    const nodeTextArray = nodeText.split(" ");
    let stealer = nodeTextArray[0];
    let victim = nodeTextArray[nodeTextArray.length - 1];

    // Substitute "You" for username
    if (stealer === "You") stealer = keywords.userName;
    else victim = keywords.userName;

    const stolenResource = parseResourceImage(node);
    dispatch({
      type: ActionType.ADD_RESOURCES,
      payload: { user: stealer, addResources: stolenResource },
    });
    dispatch({
      type: ActionType.SUBTRACT_RESOURCES,
      payload: { user: victim, subtractResources: stolenResource },
    });

    //Review steals
    dispatch({
      type: ActionType.REVIEW_STEALS,
      payload: { player: stealer === keywords.userName ? victim : stealer },
    });
  }
};

export const parseStoleUnknownMessage = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  const nodeText = node.textContent;
  if (!nodeText?.includes(keywords.stoleFromSnippet)) return false;
  if (nodeText) {
    const nodeTextArray = nodeText.split(" ");
    const stealer = nodeTextArray[0];
    const victim = nodeTextArray[nodeTextArray.length - 1];

    dispatch({ type: ActionType.UNKNOWN_STEAL, payload: { stealer, victim } });
  }
};

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

/**
 * Once initial settlements are placed, determine the players.
 */
export const recognizeUsers = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.placeInitialSettlementSnippet))
    return;
  if (node.textContent) {
    const player = node.textContent.split(" ")[0];

    const startingResources = parseResourceImage(node);

    dispatch({
      type: ActionType.INITIALIZE_USER,
      payload: { user: player, color: node.style.color, startingResources },
    });
  }
};
