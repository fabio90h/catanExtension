import { Action } from "../../../../reducer";
import { parseStoleFromYouMessage } from "../../../../scripts/actions/parseStoleFromYouMessage/parseStoleFromYouMessage.action";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

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
