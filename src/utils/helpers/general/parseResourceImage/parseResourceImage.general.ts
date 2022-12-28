import { ResourceType } from "../../../../types";
import { collectionToArray } from "../collectionToArray/collectionToArray.general";
import { imageResourceConverter } from "../imageResourceConverter/imageResourceConverter.general";

/**
 * Figures out what resources has been received from the image
 * @param node
 * @returns
 */
export const parseResourceImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));

  // Check if the image is a resource card
  return images.reduce<ResourceType[]>((acc, img) => {
    const imageData = imageResourceConverter(img.src);
    if (imageData) return [...acc, imageData];
    return acc;
  }, []);
};
