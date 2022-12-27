import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const discardCardsNode = (
  player: string,
  color: string,
  discardedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.discardedSnippet);

  discardedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  return node;
};
