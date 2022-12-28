import { PurchaseType } from "../../../../types";
import keywords from "../../../keywords";
import { imagePurchaseConverter } from "./imagePurchaseConverter.general";

it("for Roads", () => {
  const imageData = `this is ${keywords.road}`;
  expect(imagePurchaseConverter(imageData)).toBe(PurchaseType.ROAD);
});

it("for Settlement", () => {
  const imageData = `this is ${keywords.settlement}`;
  expect(imagePurchaseConverter(imageData)).toBe(PurchaseType.SETTLEMENT);
});

it("for City", () => {
  const imageData = `this is ${keywords.city}`;
  expect(imagePurchaseConverter(imageData)).toBe(PurchaseType.CITY);
});

it("for Development", () => {
  const imageData = `this is ${keywords.development}`;
  expect(imagePurchaseConverter(imageData)).toBe(PurchaseType.DEVELOPMENT);
});

it("for unknown. Should fail", () => {
  const imageData = `this is ${keywords.sheep}`;
  expect(imagePurchaseConverter(imageData)).toBeUndefined();
});
