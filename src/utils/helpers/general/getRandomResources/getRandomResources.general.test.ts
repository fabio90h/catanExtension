import { getRandomResources } from "./getRandomResources.general";

it("give the correct amount of resources", () => {
  const maxRange = 4;
  const resources = getRandomResources(maxRange);
  expect(resources.length).toBeLessThanOrEqual(maxRange);
});

it("give the correct amount of resources when not provided a number", () => {
  const resources = getRandomResources();
  expect(resources.length).toBeLessThanOrEqual(9);
});
