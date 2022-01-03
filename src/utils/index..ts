import { ResourceType, Users } from "../types";
import keywords from "./keywords";

export const collectionToArray = <T extends HTMLElement>(
  collection: HTMLCollectionOf<T>
): Array<T> => {
  return Array.prototype.slice.call(collection);
};

export const imageDataConverter = (imageData: string) => {
  if (imageData.includes(keywords.wood)) return ResourceType.WOOD;
  else if (imageData.includes(keywords.brick)) return ResourceType.BRICK;
  else if (imageData.includes(keywords.wheat)) return ResourceType.WHEAT;
  else if (imageData.includes(keywords.stone)) return ResourceType.STONE;
  else if (imageData.includes(keywords.sheep)) return ResourceType.SHEEP;
};

export const getImg = (imgType: string) => {
  const imgName = keywords[imgType];
  if (!imgName.length) throw Error("Couldn't find resource image icon");
  return `https://colonist.io/dist/images/${imgName}.svg`;
};

export const parseImage = (node: HTMLElement) => {
  const images = collectionToArray(node.getElementsByTagName("img"));

  const resources = images.reduce<ResourceType[]>((acc, img) => {
    const imageData = imageDataConverter(img.src);
    if (imageData) return [...acc, imageData];
    return acc;
  }, []);

  return resources;
};

export const checkForUserExistance = (user: string, usersData: Users) => {
  if (!usersData[user]) throw Error(`Unable to find ${user} user.`);
};
