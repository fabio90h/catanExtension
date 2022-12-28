import { Action } from "../../../../reducer";
import { parseYearOfPlenty } from "../../../../scripts/actions/parseYearOfPlenty/parseYearOfPlenty.actions";
import { ResourceType } from "../../../../types";
import { yearOfPlentyNode } from "./yearOfPlenty.node.simulator";

export const yearOfPlenty = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  pickedResources: ResourceType[]
) => {
  parseYearOfPlenty(yearOfPlentyNode(player, color, pickedResources), dispatch);
};
