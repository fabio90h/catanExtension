import { Action, ActionType } from "../reducer";
import { ImageType, PurchaseType, ResourceType, Users } from "../types";
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
export const getImg = (imgType: ImageType) => {
  const imgName: string = keywords[imgType.toLocaleLowerCase()];
  if (!imgName) throw Error("Couldn't find resource image icon");
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

const convertImgStringToResourceType = (
  innerHTML: string,
  startIndex: number,
  endIndex?: number
) => {
  return innerHTML
    .slice(startIndex, endIndex)
    .split("<img")
    .reduce<ResourceType[]>((acc, curr) => {
      const resourceType = imageResourceConverter(curr);
      if (resourceType) return [...acc, resourceType];
      return acc;
    }, []);
};

export const exchangeResources = (
  dispatch: React.Dispatch<Action>,
  player: string,
  sendingResources: ResourceType[],
  receivingResources: ResourceType[]
) => {
  dispatch({
    type: ActionType.ADD_RESOURCES,
    payload: { user: player, addResources: receivingResources },
  });
  dispatch({
    type: ActionType.SUBTRACT_RESOURCES,
    payload: { user: player, subtractResources: sendingResources },
  });
};

/**
 * Throw error if username can not be found
 * @param user
 * @param usersData
 */
export const checkForUserExistance = (user: string, usersData: Users) => {
  if (!usersData[user]) throw Error(`Unable to find ${user} user.`);
};
