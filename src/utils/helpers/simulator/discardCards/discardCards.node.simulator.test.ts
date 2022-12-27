import { ResourceType } from "../../../../types";
import { discardCardsNode } from "./discardCards.node.simulator";

it("should correctly simulate discard log node", () => {
  const user = "kelvin";
  const discarded = [ResourceType.WOOD, ResourceType.WOOD, ResourceType.WOOD];
  const color = "blue";

  const node = discardCardsNode(user, color, discarded);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} discarded <img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_lumber.svg\"></div>`
  );
});
