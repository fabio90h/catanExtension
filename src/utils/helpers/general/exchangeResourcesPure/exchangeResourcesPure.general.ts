import { Users, ResourceType, UserResources } from "../../../../types";

export const exchangeResourcesPure = (
  users: Users,
  sendingPlayer: string,
  receivingPlayer: string,
  resources: ResourceType[]
) => {
  const sendingPlayerResources: UserResources = {
    ...users[sendingPlayer].resources,
  };
  const receivingPlayerResources: UserResources = {
    ...users[receivingPlayer].resources,
  };

  resources.forEach((resource) => {
    sendingPlayerResources[resource] -= 1;
    receivingPlayerResources[resource] += 1;
  });

  users[sendingPlayer].resources = sendingPlayerResources;
  users[receivingPlayer].resources = receivingPlayerResources;

  return users;
};
