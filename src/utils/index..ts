import { PurchaseType, ResourceType, Users } from "../types";
import keywords from "./keywords";

/**
 * Converts a list of images to array
 * @param collection
 * @returns
 */
export const collectionToArray = <T extends HTMLElement>(
  collection: HTMLCollectionOf<T>
): Array<T> => {
  return Array.prototype.slice.call(collection);
};

/**
 * Finds out what type of resource was received based on the keywords
 * @param imageData
 * @returns
 */
export const imageResourceConverter = (imageData: string) => {
  if (imageData.includes(keywords.wood)) return ResourceType.WOOD;
  else if (imageData.includes(keywords.brick)) return ResourceType.BRICK;
  else if (imageData.includes(keywords.wheat)) return ResourceType.WHEAT;
  else if (imageData.includes(keywords.stone)) return ResourceType.STONE;
  else if (imageData.includes(keywords.sheep)) return ResourceType.SHEEP;
};

/**
 * Finds out what type of purchase was made based on the keywords
 * @param imageData
 * @returns
 */
export const imagePurchaseConverter = (imageData: string) => {
  if (imageData.includes(keywords.road)) return PurchaseType.ROAD;
  else if (imageData.includes(keywords.settlement))
    return PurchaseType.SETTLEMENT;
  else if (imageData.includes(keywords.city)) return PurchaseType.CITY;
  else if (imageData.includes(keywords.development))
    return PurchaseType.DEVELOPMENT;
};

/**
 * Converts imageType to a src of image
 * @param imgType
 * @returns
 */
export const getImg = (imgType: string) => {
  const imgName = keywords[imgType];
  if (!imgName.length) throw Error("Couldn't find resource image icon");
  return `https://colonist.io/dist/images/${imgName}.svg`;
};

/**
 * Figures out what resources has been received from the image
 * @param node
 * @returns
 */
export const parseResourceImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));

  // Check if the imag eis a resource card
  return images.reduce<ResourceType[]>((acc, img) => {
    const imageData = imageResourceConverter(img.src);
    if (imageData) return [...acc, imageData];
    return acc;
  }, []);
};

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

/**
 * Throw error if username can not be found
 * @param user
 * @param usersData
 */
export const checkForUserExistance = (user: string, usersData: Users) => {
  if (!usersData[user]) throw Error(`Unable to find ${user} user.`);
};
