import { Action } from "../../../../reducer";
import { parseGot } from "../../../../scripts/actions/parseGot/parseGot.actions";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const giveResourcesToPlayer = (
  dispatch: React.Dispatch<Action>,
  user: string,
  addedResources: ResourceType[],
  color: string
) => {
  const node = createDivElement(color, user, keywords.receivedResourcesSnippet);
  addedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseGot(node, dispatch);
};
