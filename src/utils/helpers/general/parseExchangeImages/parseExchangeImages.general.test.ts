import {
  createPlayersAndProperties,
  createDivElement,
  createChildImgElement,
} from "../../../../tests/utils";
import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { parseExchangeImages } from "./parseExchangeImages.general";

it("parse the resource images that is being traded with the bank", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];
  const gave = [ResourceType.WOOD, ResourceType.WOOD, ResourceType.WOOD];
  const took = [ResourceType.STONE];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.tradeBankGaveSnippet
  );

  // Creates images to simulate the logs with resource images
  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNode = document.createTextNode(keywords.tradeBankTookSnippet);
  node.appendChild(textNode);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  expect(
    parseExchangeImages(
      node,
      keywords.tradeBankGaveSnippet,
      keywords.tradeBankTookSnippet
    )
  ).toStrictEqual({
    tookResources: took,
    gaveResources: gave,
  });
});

it("parse the resource images that is being traded with another player", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];
  const gave = [ResourceType.WHEAT, ResourceType.BRICK];
  const took = [ResourceType.STONE];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.tradedWithSnippet
  );

  // Creates images to simulate the logs with resource images
  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNode = document.createTextNode(keywords.tradeEnd);
  node.appendChild(textNode);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  expect(
    parseExchangeImages(node, keywords.tradedWithSnippet, keywords.tradeEnd)
  ).toStrictEqual({
    tookResources: took,
    gaveResources: gave,
  });
});

it("parse the resource images that is being offered with another player", () => {
  const users = createPlayersAndProperties(false);
  const user = Object.keys(users)[0];
  const gave = [ResourceType.WHEAT, ResourceType.BRICK];
  const took = [ResourceType.STONE];

  // Create the node with user and the command e.g. discardedSnippet
  const node = createDivElement(
    users[user].config.color,
    user,
    keywords.proposal
  );

  // Creates images to simulate the logs with resource images
  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNode = document.createTextNode(keywords.wants);
  node.appendChild(textNode);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  expect(
    parseExchangeImages(node, keywords.proposal, keywords.wants)
  ).toStrictEqual({
    tookResources: took,
    gaveResources: gave,
  });
});
