import { Action, ActionType } from "../reducer";
import { ResourceType } from "../types";

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
