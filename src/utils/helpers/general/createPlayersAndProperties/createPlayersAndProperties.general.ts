import { UserProperties, Users } from "../../../../types";
import {
  startingResourcesAndConfig,
  testData,
  emptyResources,
} from "../../../data";
import { shuffleArray } from "../shuffleArray/shuffleArray.general";

/**
 * Create Player with config and the starting resources
 * @param allResourceStartEmpty if we want to assign empty resource to all players
 * @returns
 */
export const createPlayersAndProperties = (
  allResourceStartEmpty: boolean = false
) => {
  const shuffledStartingResourcesAndConfig = shuffleArray<UserProperties>(
    startingResourcesAndConfig
  );
  return testData.users.reduce<Users>((acc, user, index) => {
    // Assign shuffle amount of resource to player
    acc[user] = shuffledStartingResourcesAndConfig[index];
    // Remove all resources from player if allResourceStartEmpty is true
    if (allResourceStartEmpty) {
      acc[user].resources = emptyResources;
    }
    return acc;
  }, {});
};
