import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { createChildImgElement } from "../../general/createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../../general/createDivElement/createDivElement.general";

export const stoleFromOrByYouNode = (
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

  return node;
};
