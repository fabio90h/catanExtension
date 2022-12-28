import { ResourceType } from "../../../../types";
import { playerTradeNode } from "./playerTrade.node.simulator";

it("should correctly simulate bank trade log node", () => {
  const offeringPlayer = "kelvin";
  const agreedPlayer = "alex";

  const gave = [ResourceType.WOOD, ResourceType.WOOD, ResourceType.WOOD];
  const took = [ResourceType.STONE];
  const color = "blue";

  const node = playerTradeNode(offeringPlayer, agreedPlayer, gave, took, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${offeringPlayer}  traded: <img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\">for:  <img src=\"https://colonist.io/dist/images/card_ore.svg\">with:  ${agreedPlayer}</div>`
  );
});
