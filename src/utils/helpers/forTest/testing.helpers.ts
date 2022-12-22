import { Action } from "../../../reducer";
import { parseBankTrade } from "../../../scripts/actions/parseBankTrade/parseBankTrade.action";
import { parseDiscardMessage } from "../../../scripts/actions/parseDiscardMessage/parseDiscardMessage.action";
import { parseGot } from "../../../scripts/actions/parseGot/parseGot.actions";
import { parseMonopolyCard } from "../../../scripts/actions/parseMonopolyCard/parseMonopolyCard.action";
import { parsePlayersTrade } from "../../../scripts/actions/parsePlayerTrade/parsePlayerTrade.actions";
import { parsePurchase } from "../../../scripts/actions/parsePurchase/parsePurchase.actions";
import { parseProposalMessage } from "../../../scripts/actions/parseProposalMessage/parseProposalMessage.action";
import { parseRecognizeUsers } from "../../../scripts/actions/parseRecognizeUsers/parseRecognizeUsers.actions";

import { parseStoleFromYouMessage } from "../../../scripts/actions/parseStoleFromYouMessage/parseStoleFromYouMessage.action";
import { parseStoleUnknownMessage } from "../../../scripts/actions/parseStoleUnknownMessage/parseStoleUnknownMessage.action";
import { parseYearOfPlenty } from "../../../scripts/actions/parseYearOfPlenty/parseYearOfPlenty.actions";
import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
} from "../../../tests/utils";
import { ResourceType, Users, PurchaseType } from "../../../types";
import keywords from "../../keywords";

export const initiateTestingPlayers = (
  dispatch: React.Dispatch<Action>,
  allResourceStartEmpty: boolean = false
) => {
  const users = createPlayersAndProperties(allResourceStartEmpty);

  (Object.keys(users) as Array<keyof typeof users>).forEach((user) => {
    const node = createDivElement(
      users[user].config.color,
      user,
      keywords.placeInitialSettlementSnippet
    );

    (Object.keys(users[user].resources) as Array<ResourceType>).forEach(
      (resource) => {
        if (users[user].resources[resource] > 0)
          for (
            let index = 0;
            index < users[user].resources[resource];
            index++
          ) {
            createChildImgElement(node, resource);
          }
      }
    );

    parseRecognizeUsers(node, dispatch);
  });
};

export const giveResourcesToPlayer = (
  dipatch: React.Dispatch<Action>,
  user: string,
  addedResouces: ResourceType[],
  color: string
) => {
  const node = createDivElement(color, user, keywords.receivedResourcesSnippet);
  addedResouces.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseGot(node, dipatch);
};

/**
 * Method to give players resources
 * @param dipatch
 */
export const givePlayersInitialResources = (
  dispatch: React.Dispatch<Action>,
  playersResources: Record<string, ResourceType[]>,
  players: Users
) => {
  Object.entries(playersResources).forEach(([player, resources]) => {
    giveResourcesToPlayer(
      dispatch,
      player,
      resources,
      players[player].config.color
    );
  });
};

/**
 * Simulate a player making a purchase with resources
 * @param dipatch
 * @param user
 * @param purchaseType
 * @param color
 */
export const playerMakesPurchase = (
  dipatch: React.Dispatch<Action>,
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

  parsePurchase(node, dipatch);
};

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
  const node = createDivElement(color, user, keywords.tradeBankGaveSnippet);

  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNode = document.createTextNode(keywords.tradeBankTookSnippet);
  node.appendChild(textNode);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseBankTrade(node, dispatch);
};

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
  const node = createDivElement(color, offeringPlayer, keywords.proposal);

  offer.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeEnd = document.createTextNode(keywords.wants);
  node.appendChild(textNodeEnd);

  want.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseProposalMessage(node, dispatch);
};

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

  const node = createDivElement(
    color,
    offeringPlayer,
    keywords.tradedWithSnippet
  );

  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeEnd = document.createTextNode(`${keywords.tradeEnd} `);
  node.appendChild(textNodeEnd);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeAgree = document.createTextNode(
    `${keywords.tradeAgreePlayer} ${agreedPlayer}`
  );
  node.appendChild(textNodeAgree);

  parsePlayersTrade(node, dispatch);
};

/**
 * Simulates a player playing the monopoly card
 * @param dispatch
 * @param player
 * @param color
 * @param monopolizedResource
 * @param amountStolen
 */
export const monopoly = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  monopolizedResource: ResourceType,
  amountStolen: number
) => {
  const prevNode = createDivElement(color, player, keywords.stoleAllOfSnippet);

  const node = createDivElement(color, player, keywords.monoplyStole);

  createChildImgElement(node, monopolizedResource);

  const textNodeAgree = document.createTextNode(` ${amountStolen}`);
  node.appendChild(textNodeAgree);

  parseMonopolyCard(node, prevNode, dispatch);
};

export const yearOfPlenty = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  pickedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.yearOfPlenty);

  pickedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseYearOfPlenty(node, dispatch);
};

export const discardCards = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  discardedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.discardedSnippet);

  discardedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseDiscardMessage(node, dispatch);
};

export const stoleFromOrByYou = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  stolenResource: ResourceType,
  isYouTheStealer: boolean = false
) => {
  const node = createDivElement(
    color,
    isYouTheStealer ? "You" : player,
    isYouTheStealer
      ? keywords.youStoleFromSnippet
      : keywords.stoleFromYouSnippet
  );

  createChildImgElement(node, stolenResource);

  const textNodeAgree = document.createTextNode(
    `${isYouTheStealer ? player : "you"}`
  );
  node.appendChild(textNodeAgree);

  parseStoleFromYouMessage(node, dispatch);
};

export const unknownSteal = (
  dispatch: React.Dispatch<Action>,
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

  parseStoleUnknownMessage(node, dispatch);
};
