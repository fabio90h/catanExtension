import { Action, ActionType } from "../../../../reducer";
import { ResourceType } from "../../../../types";

export const exchangeResources = (
  dispatch: React.Dispatch<Action>,
  sendingPlayer: string,
  receivingPlayer: string,
  resources: ResourceType[]
) => {
  dispatch({
    type: ActionType.ADD_RESOURCES,
    payload: { user: receivingPlayer, addResources: resources },
  });
  dispatch({
    type: ActionType.SUBTRACT_RESOURCES,
    payload: { user: sendingPlayer, subtractResources: resources },
  });
};
