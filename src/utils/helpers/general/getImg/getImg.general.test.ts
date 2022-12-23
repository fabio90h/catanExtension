import { PurchaseType, ResourceType, UnknownType } from "../../../../types";
import keywords from "../../../keywords";
import { getImg } from "./getImg.general";

describe("ResourceType", () => {
  it("for Brick", () => {
    expect(getImg(ResourceType.BRICK)).toBe(
      `https://colonist.io/dist/images/${keywords.brick}.svg`
    );
  });
  it("for Wood", () => {
    expect(getImg(ResourceType.WOOD)).toBe(
      `https://colonist.io/dist/images/${keywords.wood}.svg`
    );
  });
  it("for Wheat", () => {
    expect(getImg(ResourceType.WHEAT)).toBe(
      `https://colonist.io/dist/images/${keywords.wheat}.svg`
    );
  });
  it("for Sheep", () => {
    expect(getImg(ResourceType.SHEEP)).toBe(
      `https://colonist.io/dist/images/${keywords.sheep}.svg`
    );
  });
  it("for Stone", () => {
    expect(getImg(ResourceType.STONE)).toBe(
      `https://colonist.io/dist/images/${keywords.stone}.svg`
    );
  });
});

describe("PurchaseType", () => {
  it("for Brick", () => {
    expect(getImg(PurchaseType.CITY)).toBe(
      `https://colonist.io/dist/images/${keywords.city}.svg`
    );
  });
  it("for Wood", () => {
    expect(getImg(PurchaseType.SETTLEMENT)).toBe(
      `https://colonist.io/dist/images/${keywords.settlement}.svg`
    );
  });
  it("for Wheat", () => {
    expect(getImg(PurchaseType.ROAD)).toBe(
      `https://colonist.io/dist/images/${keywords.road}.svg`
    );
  });
  it("for Sheep", () => {
    expect(getImg(PurchaseType.DEVELOPMENT)).toBe(
      `https://colonist.io/dist/images/${keywords.development}.svg`
    );
  });
});

it("for unknown", () => {
  expect(getImg(UnknownType.UNKOWN)).toBe(
    `https://colonist.io/dist/images/${keywords.unknown}.svg`
  );
});
