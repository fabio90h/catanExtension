import { ImageType } from "../../../../types";
import keywords from "../../../keywords";

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
