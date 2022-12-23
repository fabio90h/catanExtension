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
