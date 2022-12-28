import { PurchaseType } from "../../../../types";
import keywords from "../../../keywords";

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
