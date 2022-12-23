import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { PurchaseType } from "../../../../types";
import keywords from "../../../keywords";
import { parsePurchaseImage } from "./parsePurchaseImage.general";

it("parse city purchase images to PurchaseType", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.builtSnippet
  );

  // Creates images to simulate the logs with resource images
  createChildImgElement(node, PurchaseType.CITY);

  expect(parsePurchaseImage(node)).toStrictEqual(PurchaseType.CITY);
});

it("parse road purchase images to PurchaseType", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.builtSnippet
  );

  // Creates images to simulate the logs with resource images
  createChildImgElement(node, PurchaseType.ROAD);

  expect(parsePurchaseImage(node)).toStrictEqual(PurchaseType.ROAD);
});

it("parse settlement purchase images to PurchaseType", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.builtSnippet
  );

  // Creates images to simulate the logs with resource images
  createChildImgElement(node, PurchaseType.SETTLEMENT);

  expect(parsePurchaseImage(node)).toStrictEqual(PurchaseType.SETTLEMENT);
});

it("parse development purchase images to PurchaseType", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.boughtSnippet
  );

  // Creates images to simulate the logs with resource images
  createChildImgElement(node, PurchaseType.DEVELOPMENT);

  expect(parsePurchaseImage(node)).toStrictEqual(PurchaseType.DEVELOPMENT);
});
