import { ResourceType } from "../../../../types";
import keywords from "../../../keywords";

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
