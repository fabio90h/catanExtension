import { ResourceType, Theft } from "../../../../types";
import { createKeyForHash } from "../createKeyForHash/createKeyForHash.general";
import { createVictimHash } from "./createVictimHash.general";

it("no duplicates in thefts", () => {
  const thefts: Theft[] = [
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: { [ResourceType.WHEAT]: 2, [ResourceType.BRICK]: 1 },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ];

  // Create key for the hash
  const key1 = createKeyForHash(
    thefts[0].who.victim,
    thefts[0].who.stealer,
    thefts[0].what
  );
  const key2 = createKeyForHash(
    thefts[1].who.victim,
    thefts[1].who.stealer,
    thefts[1].what
  );

  const hash = createVictimHash(thefts);
  expect(hash).toStrictEqual({
    [key1]: { reoccurrence: 1, resourceAmount: 2 },
    [key2]: { reoccurrence: 1, resourceAmount: 2 },
  });
});

it("witch duplicates in thefts", () => {
  const thefts: Theft[] = [
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
    {
      who: { stealer: "Kelvin", victim: "Alex" },
      what: {
        [ResourceType.WHEAT]: 2,
        [ResourceType.BRICK]: 1,
        [ResourceType.STONE]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: {
        [ResourceType.STONE]: 1,
        [ResourceType.WOOD]: 1,
      },
    },
    {
      who: { stealer: "Alex", victim: "Gali" },
      what: { [ResourceType.STONE]: 1, [ResourceType.WOOD]: 1 },
    },
  ];

  // Create key for the hash
  const key1 = createKeyForHash(
    thefts[0].who.victim,
    thefts[0].who.stealer,
    thefts[0].what
  );
  const key2 = createKeyForHash(
    thefts[1].who.victim,
    thefts[1].who.stealer,
    thefts[1].what
  );

  const hash = createVictimHash(thefts);
  expect(hash).toStrictEqual({
    [key1]: { reoccurrence: 3, resourceAmount: 2 },
    [key2]: { reoccurrence: 1, resourceAmount: 3 },
  });
});
