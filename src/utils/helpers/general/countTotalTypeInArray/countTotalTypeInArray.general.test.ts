import { ResourceType } from "../../../../types";
import { countTotalTypeInArray } from "./countTotalTypeInArray.general";

it("Should correctly count how many resource is in an array when specified", () => {
  const resourceArray = [
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.WOOD,
    ResourceType.WHEAT,
    ResourceType.WHEAT,
    ResourceType.STONE,
  ];

  expect(countTotalTypeInArray(resourceArray, ResourceType.WOOD)).toBe(5);
  expect(countTotalTypeInArray(resourceArray, ResourceType.WHEAT)).toBe(2);
  expect(countTotalTypeInArray(resourceArray, ResourceType.STONE)).toBe(1);
  expect(countTotalTypeInArray(resourceArray, ResourceType.BRICK)).toBe(0);
  expect(countTotalTypeInArray(resourceArray, ResourceType.SHEEP)).not.toBe(5);
});
