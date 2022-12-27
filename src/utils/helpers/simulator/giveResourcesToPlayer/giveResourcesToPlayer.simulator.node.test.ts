import { ResourceType } from "../../../../types";
import { giveResourcesToPlayerNode } from "./giveResourcesToPlayer.node.simulator";

it("should correctly simulate 'got resource' log node", () => {
  const user = "kelvin";
  const addedResources = [
    ResourceType.WOOD,
    ResourceType.STONE,
    ResourceType.WHEAT,
  ];
  const color = "blue";

  const node = giveResourcesToPlayerNode(user, addedResources, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} got: <img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_ore.svg\"><img src=\"https://colonist.io/dist/images/card_grain.svg\"></div>`
  );
});
