import {
  createChildImgElement,
  createDivElement,
  createPlayersAndProperties,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { parseResourceImage } from "./parseResourceImage.general";

it("parse discardedSnippet resources images to array of resources", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];
  const resources = [ResourceType.WOOD, ResourceType.WHEAT, ResourceType.STONE];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.discardedSnippet
  );

  // Creates images to simulate the logs with resource images
  resources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  expect(parseResourceImage(node)).toStrictEqual(resources);
});
