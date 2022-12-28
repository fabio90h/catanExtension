import { PurchaseType, ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { createChildImgElement } from "../createChildImgElement/createChildImgElement.general";
import { createDivElement } from "../createDivElement/createDivElement.general";
import { createPlayersAndProperties } from "../createPlayersAndProperties/createPlayersAndProperties.general";
import { getImg } from "../getImg/getImg.general";
import { collectionToArray } from "./collectionToArray.general";

it("parse img html to and array", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];
  const resources = [ResourceType.WOOD, ResourceType.BRICK];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.builtSnippet
  );

  // Creates images to simulate the logs with resource images
  resources.forEach((resource) => createChildImgElement(node, resource));
  const imgElements = resources.map((resource) => createImgElement(resource));

  expect(collectionToArray(node.getElementsByTagName("img"))).toStrictEqual(
    imgElements
  );
});

const createImgElement = (imageType: ResourceType | PurchaseType) => {
  const img = document.createElement("img");
  img.setAttribute("src", getImg(imageType));
  return img;
};
