import { collectionToArray } from "../collectionToArray/collectionToArray.general";
import { imagePurchaseConverter } from "../imagePurchaseConverter/imagePurchaseConverter.general";

/**
 * Figures out what has been bought from the image
 * @param node
 * @returns
 */
export const parsePurchaseImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));
  //Get the second image since the first is the player icon
  return images
    .map((image) => imagePurchaseConverter(image.src))
    .find((image) => image !== undefined);
};
