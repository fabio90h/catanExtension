import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const yearOfPlentyNode = (
  player: string,
  color: string,
  pickedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.yearOfPlenty);

  pickedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  return node;
};
