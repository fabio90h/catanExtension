import { createKeyForHash } from "./createKeyForHash.general";
import { ResourceType } from "../../../../types";

it("createKeyForHash", () => {
  const victim = "victim";
  const stealer = "stealer";
  const possibleStolenResources = {
    [ResourceType.BRICK]: 1,
    [ResourceType.WHEAT]: 1,
  };

  const key = createKeyForHash(victim, stealer, possibleStolenResources);
  expect(key).toEqual("victim_stealer:BRICK_WHEAT");
});
