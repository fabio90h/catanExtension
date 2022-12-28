import { Theft, ResourceType } from "../../../../types";
import { reduceOtherThefts } from "./reduceOtherThefts.general";

it("should remove the resources in the possible theft if we know that it was not involved.", () => {
  const thefts: Theft[] = [
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 1,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ];
  const knownResource = ResourceType.BRICK;
  const victim = "Alex";

  expect(reduceOtherThefts(thefts, victim, knownResource)).toStrictEqual([
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ]);
});

it("should reduce resources possibility in the possible theft if we know that it was not involved.", () => {
  const thefts: Theft[] = [
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.BRICK]: 2,
        [ResourceType.SHEEP]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ];
  const knownResource = ResourceType.BRICK;
  const victim = "Alex";

  expect(reduceOtherThefts(thefts, victim, knownResource)).toStrictEqual([
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.BRICK]: 1,
      },
    },
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 1,
        [ResourceType.SHEEP]: 1,
        [ResourceType.BRICK]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ]);
});
