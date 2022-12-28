import { ResourceType } from "../../../../types";
import { monopolyNode } from "./monopoly.node.simulator";

it("should correctly simulate monopoly node", () => {
  const user = "kelvin";
  const color = "blue";

  const [node, prevNode] = monopolyNode(user, color, ResourceType.WOOD, 4);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: blue;\">kelvin used Monopoly </div>`
  );
  expect(prevNode.outerHTML).toEqual(
    `<div style=\"color: blue;\">kelvin stole  <img src=\"https://colonist.io/dist/images/card_lumber.svg\"> 4</div>`
  );
});
