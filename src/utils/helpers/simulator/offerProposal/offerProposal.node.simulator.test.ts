import { ResourceType } from "../../../../types";
import { offerProposalNode } from "./offerProposal.node.simulator";

it("should correctly simulate offer log node", () => {
  const user = "kelvin";
  const offered = [ResourceType.WOOD, ResourceType.WHEAT, ResourceType.BRICK];
  const want = [ResourceType.STONE];
  const color = "blue";

  const node = offerProposalNode(user, offered, want, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user}  wants to give: <img src=\"https://colonist.io/dist/images/card_lumber.svg\"><img src=\"https://colonist.io/dist/images/card_grain.svg\"><img src=\"https://colonist.io/dist/images/card_brick.svg\">for:<img src=\"https://colonist.io/dist/images/card_ore.svg\"></div>`
  );
});
