import { ResourceType, PurchaseType } from "../../../../types";
import { getImg } from "../getImg/getImg.general";

/**
 * Creates the card image that we see in the game log
 * @param node
 * @param imageType
 * @returns
 */
export const createChildImgElement = (
  node: HTMLElement,
  imageType: ResourceType | PurchaseType
) => {
  const img = document.createElement("img");
  img.setAttribute("src", getImg(imageType));
  node.appendChild(img);
  return node;
};
