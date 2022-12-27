import { ResourceType } from "../../../../types";
import { yearOfPlentyNode } from "./yearOfPlenty.node.simulator";

it("should correctly simulate 'year of plenty' log node", () => {
  const user = "kelvin";
  const took = [ResourceType.STONE, ResourceType.WHEAT];
  const color = "blue";

  const node = yearOfPlentyNode(user, color, took);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: blue;\">kelvin  took from bank <img src=\"https://colonist.io/dist/images/card_ore.svg\"><img src=\"https://colonist.io/dist/images/card_grain.svg\"></div>`
  );
});
