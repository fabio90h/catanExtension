import { Action, ActionType } from "../reducer";
import { ResourceType, Theft, UserResources, Users } from "../types";
import { createVictimHash } from "./helpers/general/createVictimHash/createVictimHash.general";
import { exchangeResourcesPure } from "./helpers/general/exchangeResourcesPure/exchangeResourcesPure.general";

export const manuallyResolveUnknownTheft = (
  dispatch: React.Dispatch<Action>,
  resource: ResourceType,
  stealer: string,
  victim: string,
  id: number
) => {
  dispatch({
    type: ActionType.ADD_RESOURCES,
    payload: { user: stealer, addResources: [resource] },
  });
  dispatch({
    type: ActionType.SUBTRACT_RESOURCES,
    payload: { user: victim, subtractResources: [resource] },
  });
  dispatch({
    type: ActionType.RESOLVE_UNKNOWN_STEAL,
    payload: { id },
  });
};

/**
 * Creates a hash where the value is the amount of times it
 * showed up in the array.
 */
export const hashCounter = <T extends string>(array: T[]) => {
  return array.reduce((acc, curr) => {
    acc[curr] = acc[curr] ? acc[curr] + 1 : 1;
    return acc;
  }, {} as Record<T, number>);
};

/**
 * After the steal possibilities are reduced, if the remaining possibility is 1 then we
 * know what was stolen.
 */
export const checkForOneResourceThefts = (
  thefts: Theft[],
  users: Users
): [Theft[], Users] => {
  const theftsTemp = [...thefts];
  let usersTemp = { ...users } as Users;

  for (let index = 0; index < thefts.length; index++) {
    const remainingResourcePossibilities = Object.keys(
      thefts[index].what
    ) as ResourceType[];

    if (remainingResourcePossibilities.length === 1) {
      usersTemp = exchangeResourcesPure(
        users,
        thefts[index].who.victim,
        thefts[index].who.stealer,
        remainingResourcePossibilities
      );
      // Resolve theft
      theftsTemp.splice(index, 1);
      console.log(
        "Theft solved because it was the remaining resource in the theft!"
      );
    }
  }

  return [theftsTemp, usersTemp];
};

/**
 * If the number of thefts for a specific victim is the same amount of possible resource that can be
 * stolen then it is safe to assume that those were the resources stolen.
 *
 * For example:
 *  [
 *    {"what": {"SHEEP": 1, "STONE": 1}, "who": {"stealer": "Gali", "victim": "Alex"}},
 *    {"what": {"SHEEP": 1, "STONE": 1}, "who": {"stealer": "Kelvin", "victim": "Alex"}}
 *  ]
 * Here we see that Alex was a victim twice. We can also see that he only has 2 possible resources to
 * be stolen from. Thus it is safe to conclude that what was stolen was the SHEEP and the STONE. However, we
 * just wont know where that stolen resource end up. If the stealer is the same then we know that both were sent
 * to the stealer
 *
 */
export const doubleUnknownStealResolve = (
  thefts: Theft[],
  users: Users
): [Theft[], Users] => {
  const victimHash = createVictimHash(thefts);
  const alreadyDeleted = {};
  for (let i = 0; i < thefts.length; i++) {
    const players = `${thefts[i].who.victim}_${thefts[i].who.stealer}`;
    const possibleResourceStolen = Object.keys(thefts[i].what).join("_");
    const key = `${players}:${possibleResourceStolen}`;
    if (victimHash[key].reoccurrence === victimHash[key].resourceAmount) {
      if (!alreadyDeleted[key]) {
        // Update the resources
        users = exchangeResourcesPure(
          users,
          thefts[i].who.victim,
          thefts[i].who.stealer,
          Object.keys(thefts[i].what) as ResourceType[]
        );
        console.log("Exchange was executed", Object.keys(thefts[i].what), key);
      } else {
        console.log("Was already exchanged", alreadyDeleted, key);
      }
      thefts.splice(i, 1);
      i--;
      console.log(
        "Theft solved because the amount of steals matched the possible resources that can be stolen!"
      );
      alreadyDeleted[key] = 1;
    }
  }

  return [thefts, users];
};
