import { Action } from "../../../../reducer";
import { parseRecognizeUsers } from "../../../../scripts/actions/parseRecognizeUsers/parseRecognizeUsers.actions";
import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

export const initiateTestingPlayers = (
  dispatch: React.Dispatch<Action>,
  allResourceStartEmpty: boolean = false
) => {
  const users = createPlayersAndProperties(allResourceStartEmpty);

  (Object.keys(users) as Array<keyof typeof users>).forEach((user) => {
    const node = createDivElement(
      users[user].config.color,
      user,
      keywords.placeInitialSettlementSnippet
    );

    (Object.keys(users[user].resources) as Array<ResourceType>).forEach(
      (resource) => {
        if (users[user].resources[resource] > 0)
          for (
            let index = 0;
            index < users[user].resources[resource];
            index++
          ) {
            createChildImgElement(node, resource);
          }
      }
    );

    parseRecognizeUsers(node, dispatch);
  });
};
