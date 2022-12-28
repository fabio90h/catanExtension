import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { act } from "react-dom/test-utils";
import { reducer } from "../../../reducer";

import { ResourceType } from "../../../types";
import { createChildImgElement } from "../../../utils/helpers/general/createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../../../utils/helpers/general/createDivElement/createDivElement.general";
import { createPlayersAndProperties } from "../../../utils/helpers/general/createPlayersAndProperties/createPlayersAndProperties.general";
import keywords from "../../../utils/keywords";
import { parseRecognizeUsers } from "./parseRecognizeUsers.actions";

const { result: hookResult } = renderHook(() =>
  React.useReducer(reducer, {
    users: {},
    thefts: [],
  })
);

const result = hookResult;

it("Recognizes players, their initial resources, and their color", () => {
  const users = createPlayersAndProperties();

  (Object.keys(users) as Array<keyof typeof users>).forEach((user) => {
    // Create HTML for each users
    const node = createDivElement(
      users[user].config.color,
      user,
      keywords.placeInitialSettlementSnippet
    );

    // Give the initial resources to each player
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

    act(() => parseRecognizeUsers(node as HTMLElement, result.current[1]));

    expect(result.current[0].users[user].resources).toStrictEqual(
      users[user].resources
    );
    expect(result.current[0].users[user].config).toStrictEqual(
      users[user].config
    );
    expect(result.current[0].users[user].resources).not.toStrictEqual({
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 1,
      [ResourceType.BRICK]: 2,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 1,
    });
  });
});
