import { PurchaseType, ResourceType } from "../../../../types";
import { createChildImgElement } from "./createChildImgElement.general";

it("Create a resource image element under a node", () => {
  const node = document.createElement("div");
  expect(createChildImgElement(node, ResourceType.WHEAT).outerHTML).toBe(
    `<div><img src=\"https://colonist.io/dist/images/card_grain.svg\"></div>`
  );
});

it("Create a purchase image element under a node", () => {
  const node = document.createElement("div");
  expect(createChildImgElement(node, PurchaseType.CITY).outerHTML).toBe(
    `<div><img src=\"https://colonist.io/dist/images/city.svg\"></div>`
  );
});
