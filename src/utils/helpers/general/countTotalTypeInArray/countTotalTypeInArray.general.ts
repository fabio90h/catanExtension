/**
 * Counts the total amount of a specific type that is found in an array
 * @param arrayWithType
 * @param typeToBeCounted
 * @returns
 */
export const countTotalTypeInArray = <T>(
  arrayWithType: T[],
  typeToBeCounted: T
) => {
  return arrayWithType.reduce(
    (acc, type) => (typeToBeCounted === type ? acc + 1 : acc),
    0
  );
};
