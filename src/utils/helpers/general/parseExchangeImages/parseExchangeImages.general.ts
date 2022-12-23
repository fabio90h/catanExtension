import { convertImgStringToResourceType } from "../convertImgStringToResourceType/convertImgStringToResourceType.general";

/**
 * Figures out what is being sent out and what is being received. This
 * can be a offer, or trade.
 */
export const parseExchangeImages = (
  node: HTMLElement,
  gaveMessage: string,
  tookMessage: string
) => {
  const innerHTML = node.innerHTML;
  const gaveIndex = innerHTML.indexOf(gaveMessage);
  const tookIndex = innerHTML.indexOf(tookMessage);

  const gaveResources = convertImgStringToResourceType(
    innerHTML,
    gaveIndex,
    tookIndex
  );
  const tookResources = convertImgStringToResourceType(innerHTML, tookIndex);

  return {
    tookResources,
    gaveResources,
  };
};
