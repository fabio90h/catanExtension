import { Users } from "../../../../types";

/**
 * Throw error if username can not be found
 * @param user
 * @param usersData
 */
export const checkForUserExistence = (user: string, usersData: Users) => {
  if (!usersData[user]) throw Error(`Unable to find ${user} user.`);
};
