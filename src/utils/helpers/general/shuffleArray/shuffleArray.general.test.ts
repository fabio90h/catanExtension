import { shuffleArray } from "./shuffleArray.general";

it("should successfully shuffle an array", () => {
  const arr1 = ["a", "b", "c", "d"];
  const arr2 = shuffleArray(arr1);
  expect(arr1).not.toBe(arr2);
});
