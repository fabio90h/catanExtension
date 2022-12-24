import { Action } from "../../../../reducer";
import { parseYearOfPlenty } from "../../../../scripts/actions/parseYearOfPlenty/parseYearOfPlenty.actions";
import {
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const yearOfPlenty = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  pickedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.yearOfPlenty);

  pickedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseYearOfPlenty(node, dispatch);
};
