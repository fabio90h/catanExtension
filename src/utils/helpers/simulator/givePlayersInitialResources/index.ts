import { Action } from "../../../../reducer";
import { ResourceType, Users } from "../../../../types";
import { giveResourcesToPlayer } from "../giveResourcesToPlayer";

/**
 * Method to give players defined resources.
 * @param dispatch
 */
export const givePlayersInitialResources = (
  dispatch: React.Dispatch<Action>,
  playersResources: Record<string, ResourceType[]>,
  players: Users
) => {
  Object.entries(playersResources).forEach(([player, resources]) => {
    giveResourcesToPlayer(
      dispatch,
      player,
      resources,
      players[player].config.color
    );
  });
};
