import { Action } from "../../../../reducer";
import { parseBankTrade } from "../../../../scripts/actions/parseBankTrade/parseBankTrade.action";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

/**
 * Simulate a player making a trade with the bank
 * @param dispatch
 * @param user
 * @param gave
 * @param took
 * @param color
 */
export const bankTradeNode = (
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

  return node;
};
