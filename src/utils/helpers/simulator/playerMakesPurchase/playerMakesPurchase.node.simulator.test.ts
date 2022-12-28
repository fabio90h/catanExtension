import { PurchaseType } from "../../../../types";
import { playerMakesPurchaseNode } from "./playerMakesPurchase.node.simulator";

const user = "kelvin";
const color = "blue";

it("should correctly simulate road built log node", () => {
  const node = playerMakesPurchaseNode(user, PurchaseType.ROAD, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} built a <img src=\"https://colonist.io/dist/images/road.svg\"></div>`
  );
});

it("should correctly simulate city built log node", () => {
  const node = playerMakesPurchaseNode(user, PurchaseType.CITY, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} built a <img src=\"https://colonist.io/dist/images/city.svg\"></div>`
  );
});

it("should correctly simulate settlement built log node", () => {
  const node = playerMakesPurchaseNode(user, PurchaseType.SETTLEMENT, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: ${color};\">${user} built a <img src=\"https://colonist.io/dist/images/settlement.svg\"></div>`
  );
});

it("should correctly simulate development card bought log node", () => {
  const node = playerMakesPurchaseNode(user, PurchaseType.DEVELOPMENT, color);
  expect(node.outerHTML).toEqual(
    `<div style=\"color: blue;\">kelvin  bought  <img src=\"https://colonist.io/dist/images/devcardback.svg\"></div>`
  );
});
