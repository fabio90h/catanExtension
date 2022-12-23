import { ResourceType } from "../../../../types";
import { imageResourceConverter } from "../imageResourceConverter/imageResourceConverter.general";

export const convertImgStringToResourceType = (
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
