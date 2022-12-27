import { ResourceType } from "../../../../types";
import { bankTradeNode } from "./bankTrade.node.simulator";

it("should correctly simulate bank trade log node", () => {
  const user = "kelvin";
  const gave = [ResourceType.WOOD, ResourceType.WOOD, ResourceType.WOOD];
  const took = [ResourceType.STONE];
  const color = "blue";

  const node = bankTradeNode(user, gave, took, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} gave bank: <img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\">and took<img src=\"https://colonist.io/dist/images/card_ore.svg\"></div>`
  );
});
