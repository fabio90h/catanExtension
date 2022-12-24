import { Action } from "../../../../reducer";
import { parseDiscardMessage } from "../../../../scripts/actions/parseDiscardMessage/parseDiscardMessage.action";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

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
