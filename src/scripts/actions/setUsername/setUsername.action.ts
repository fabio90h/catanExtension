import { Action, ActionType } from "../../../reducer";

/**
 * Set the primary username so that it can be tracked
 * @param dispatch
 * @returns
 */
export const setUsername = (
  username: string,
  dispatch: React.Dispatch<Action>
) => {
  dispatch({
    type: ActionType.SET_USERNAME,
    payload: { username },
  });
};
