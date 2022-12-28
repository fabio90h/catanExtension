import { Theft, ResourceType } from "../../../../types";
import { calculateTheftForPlayerAndResources } from "./calculateTheftForPlayerAndResources.general";

const thefts: Theft[] = [
  {
    who: { stealer: "Kelvin", victim: "Alex" },
    what: { [ResourceType.WHEAT]: 2, [ResourceType.BRICK]: 1 },
  },
  {
    who: { stealer: "Alex", victim: "Gali" },
    what: {
      [ResourceType.STONE]: 1,
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 1,
    },
  },
];

it("when player is the stealer involving the resource in question", () => {
  const player = "Alex";
  const resource = ResourceType.WOOD;

  expect(calculateTheftForPlayerAndResources(player, resource, thefts)).toBe(1);
});

it("when player is the victim involving the resource in question", () => {
  const player = "Alex";
  const resource = ResourceType.BRICK;

  expect(calculateTheftForPlayerAndResources(player, resource, thefts)).toBe(
    -1
  );
});

it("when player is the stealer and the victim involving the resource in question", () => {
  thefts.push({
    who: { stealer: "Kelvin", victim: "Alex" },
    what: {
      [ResourceType.STONE]: 1,
      [ResourceType.WHEAT]: 1,
    },
  });
  const player = "Alex";
  const resource = ResourceType.STONE;

  expect(calculateTheftForPlayerAndResources(player, resource, thefts)).toBe(0);
});
