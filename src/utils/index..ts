import { BuildType, ResourceType, Users } from "../types";
import keywords from "./keywords";

export const collectionToArray = <T extends HTMLElement>(
  collection: HTMLCollectionOf<T>
): Array<T> => {
  return Array.prototype.slice.call(collection);
};

export const imageResourceConverter = (imageData: string) => {
  if (imageData.includes(keywords.wood)) return ResourceType.WOOD;
  else if (imageData.includes(keywords.brick)) return ResourceType.BRICK;
  else if (imageData.includes(keywords.wheat)) return ResourceType.WHEAT;
  else if (imageData.includes(keywords.stone)) return ResourceType.STONE;
  else if (imageData.includes(keywords.sheep)) return ResourceType.SHEEP;
};

export const imageBuildConverter = (imageData: string) => {
  if (imageData.includes(keywords.road)) return BuildType.ROAD;
  else if (imageData.includes(keywords.settlement)) return BuildType.SETTLEMENT;
  else if (imageData.includes(keywords.city)) return BuildType.CITY;
};

export const getImg = (imgType: string) => {
  const imgName = keywords[imgType];
  if (!imgName.length) throw Error("Couldn't find resource image icon");
  return `https://colonist.io/dist/images/${imgName}.svg`;
};

export const parseResourceImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));

  // Check if the imag eis a resource card
  return images.reduce<ResourceType[]>((acc, img) => {
    const imageData = imageResourceConverter(img.src);
    if (imageData) return [...acc, imageData];
    return acc;
  }, []);
};

// Will get
export const parseBuildImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));
  //Get the second image since the first is the player icon
  return images
    .map((image) => imageBuildConverter(image.src))
    .find((image) => image !== undefined);
};

export const checkForUserExistance = (user: string, usersData: Users) => {
  if (!usersData[user]) throw Error(`Unable to find ${user} user.`);
};
