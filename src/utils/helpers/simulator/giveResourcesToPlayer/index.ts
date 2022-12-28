import { Action } from "../../../../reducer";
import { parseGot } from "../../../../scripts/actions/parseGot/parseGot.actions";

import { ResourceType } from "../../../../types";

import { giveResourcesToPlayerNode } from "./giveResourcesToPlayer.node.simulator";

export const giveResourcesToPlayer = (
  dispatch: React.Dispatch<Action>,
  user: string,
  addedResources: ResourceType[],
  color: string
) => {
  parseGot(giveResourcesToPlayerNode(user, addedResources, color), dispatch);
};
