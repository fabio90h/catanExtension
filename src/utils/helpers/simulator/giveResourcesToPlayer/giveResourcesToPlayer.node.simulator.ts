import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { createChildImgElement } from "../../general/createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../../general/createDivElement/createDivElement.general";

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
