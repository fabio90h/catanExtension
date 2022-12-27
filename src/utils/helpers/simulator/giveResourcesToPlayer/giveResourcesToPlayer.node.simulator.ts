import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const giveResourcesToPlayerNode = (
  user: string,
  addedResources: ResourceType[],
  color: string
) => {
  const node = createDivElement(color, user, keywords.receivedResourcesSnippet);
  addedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  return node;
};
