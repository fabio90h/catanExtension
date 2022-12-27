import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

/**
 * Simulates a player accepting a trade offer
 * @param dispatch
 * @param offeringPlayer
 * @param agreedPlayer
 * @param gave
 * @param took
 * @param color
 */
export const playerTradeNode = (
  offeringPlayer: string,
  agreedPlayer: string,
  gave: ResourceType[],
  took: ResourceType[],
  color: string
) => {
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

  return node;
};
