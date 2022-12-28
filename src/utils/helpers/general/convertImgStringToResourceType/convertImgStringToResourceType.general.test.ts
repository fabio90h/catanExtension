import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";
import { convertImgStringToResourceType } from "./convertImgStringToResourceType.general";

it("For got", () => {
  const innerHTML =
    '<img src="/dist/images/icon_bot.svg?v147" alt="bot" height="20" width="20">Pete got: <img src="/dist/images/card_brick.svg?v147" alt="brick" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_brick.svg?v147" alt="brick" height="20" width="14.25" class="lobby-chat-text-icon">';
  const startIndex = innerHTML.indexOf(keywords.receivedResourcesSnippet);
  const receivedResources = convertImgStringToResourceType(
    innerHTML,
    startIndex
  );

  expect(receivedResources).toStrictEqual([
    ResourceType.BRICK,
    ResourceType.BRICK,
  ]);
});

it("making a trade with player", () => {
  const innerHTML =
    '<div class="message_post" id="" style="color: rgb(226, 113, 116);"><img src="/dist/images/icon_player.svg?v147" alt="Guest" height="20" width="20">Ivey#0853 traded:  <img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon">for:  <img src="/dist/images/card_wool.svg?v147" alt="wool" height="20" width="14.25" class="lobby-chat-text-icon"> with: Mosley</div>';
  const gaveIndex = innerHTML.indexOf(keywords.tradedWithSnippet);
  const tookIndex = innerHTML.indexOf(keywords.tradeEnd);

  const receivedResources = convertImgStringToResourceType(
    innerHTML,
    tookIndex
  );
  expect(receivedResources).toStrictEqual([ResourceType.SHEEP]);

  const gaveResources = convertImgStringToResourceType(
    innerHTML,
    gaveIndex,
    tookIndex
  );
  expect(gaveResources).toStrictEqual([ResourceType.WHEAT]);
});

it("making a trade with bank", () => {
  const innerHTML =
    '<div class="message_post" id="" style="color: rgb(226, 113, 116);"><img src="/dist/images/icon_player.svg?v147" alt="Guest" height="20" width="20">Ivey#0853 gave bank:   <img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon"> and took   <img src="/dist/images/card_lumber.svg?v147" alt="lumber" height="20" width="14.25" class="lobby-chat-text-icon"></div>';
  const gaveIndex = innerHTML.indexOf(keywords.tradeBankGaveSnippet);
  const tookIndex = innerHTML.indexOf(keywords.tradeBankTookSnippet);

  const receivedResources = convertImgStringToResourceType(
    innerHTML,
    tookIndex
  );
  expect(receivedResources).toStrictEqual([ResourceType.WOOD]);

  const gaveResources = convertImgStringToResourceType(
    innerHTML,
    gaveIndex,
    tookIndex
  );
  expect(gaveResources).toStrictEqual([
    ResourceType.WHEAT,
    ResourceType.WHEAT,
    ResourceType.WHEAT,
    ResourceType.WHEAT,
  ]);
});

it("making an offer", () => {
  const innerHTML =
    '<div class="message_post" id="" style="color: rgb(226, 113, 116);"><img src="/dist/images/icon_player.svg?v147" alt="Guest" height="20" width="20">Ivey#0853 wants to give:  <img src="/dist/images/card_brick.svg?v147" alt="brick" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_wool.svg?v147" alt="wool" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_grain.svg?v147" alt="grain" height="20" width="14.25" class="lobby-chat-text-icon"> for:  <img src="/dist/images/card_lumber.svg?v147" alt="lumber" height="20" width="14.25" class="lobby-chat-text-icon"><img src="/dist/images/card_lumber.svg?v147" alt="lumber" height="20" width="14.25" class="lobby-chat-text-icon"></div>';
  const gaveIndex = innerHTML.indexOf(keywords.proposal);
  const tookIndex = innerHTML.indexOf(keywords.wants);

  const receivedResources = convertImgStringToResourceType(
    innerHTML,
    tookIndex
  );
  expect(receivedResources).toStrictEqual([
    ResourceType.WOOD,
    ResourceType.WOOD,
  ]);

  const gaveResources = convertImgStringToResourceType(
    innerHTML,
    gaveIndex,
    tookIndex
  );
  expect(gaveResources).toStrictEqual([
    ResourceType.BRICK,
    ResourceType.SHEEP,
    ResourceType.WHEAT,
  ]);
});
