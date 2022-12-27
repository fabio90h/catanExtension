import { ResourceType } from "../../../../types";
import { stoleFromOrByYouNode } from "./stoleFromOrByYou.node.simulator";

it("should correctly simulate stole from you log node", () => {
  const user = "kelvin";
  const took = ResourceType.STONE;
  const color = "blue";

  const node = stoleFromOrByYouNode(user, color, took);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: blue;\">kelvin  stole:   from  <img src=\"https://colonist.io/dist/images/card_ore.svg\">you</div>`
  );
});

it("should correctly simulate stole by you log node", () => {
  const user = "kelvin";
  const took = ResourceType.WOOD;
  const color = "red";

  const node = stoleFromOrByYouNode(user, color, took, true);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: red;\">You  stole:   from:  <img src=\"https://colonist.io/dist/images/card_lumber.svg\">kelvin</div>`
  );
});
