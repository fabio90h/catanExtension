import { unknownStealNode } from "./unknownSteal.node.simulator";

it("should correctly simulate unknown steal log node", () => {
  const victim = "kelvin";
  const stealer = "gali";
  const color = "blue";

  const node = unknownStealNode(victim, stealer, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: blue;\">gali  stole   from:  kelvin</div>`
  );
});
