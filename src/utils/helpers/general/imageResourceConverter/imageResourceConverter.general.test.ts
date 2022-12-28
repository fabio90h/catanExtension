import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { imageResourceConverter } from "./imageResourceConverter.general";

it("for Brick", () => {
  const imageData = `this is ${keywords.brick}`;
  expect(imageResourceConverter(imageData)).toBe(ResourceType.BRICK);
});

it("for Wood", () => {
  const imageData = `this is ${keywords.wood}`;
  expect(imageResourceConverter(imageData)).toBe(ResourceType.WOOD);
});

it("for Wheat", () => {
  const imageData = `this is ${keywords.wheat}`;
  expect(imageResourceConverter(imageData)).toBe(ResourceType.WHEAT);
});

it("for Stone", () => {
  const imageData = `this is ${keywords.stone}`;
  expect(imageResourceConverter(imageData)).toBe(ResourceType.STONE);
});

it("for Sheep", () => {
  const imageData = `this is ${keywords.sheep}`;
  expect(imageResourceConverter(imageData)).toBe(ResourceType.SHEEP);
});

it("for unknown. Should fail.", () => {
  const imageData = `this is unknown}`;
  expect(imageResourceConverter(imageData)).toBeUndefined();
});
