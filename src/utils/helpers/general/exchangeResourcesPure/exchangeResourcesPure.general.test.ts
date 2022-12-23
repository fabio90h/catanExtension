import { emptyResources } from "../../../../tests/utils";
import { ResourceType, Users } from "../../../../types";
import { exchangeResourcesPure } from "./exchangeResourcesPure.general";

const users: Users = {
  Gali: {
    resources: {
      ...emptyResources,
      WHEAT: 1,
    },
    config: {
      color: "blue",
    },
  },
  Kelvin: {
    resources: {
      ...emptyResources,
      WHEAT: 3,
      WOOD: 2,
    },
    config: {
      color: "red",
    },
  },
};

const usersArray = Object.keys(users);

it("exchangeResourcesPure", () => {
  const sendingPlayer = usersArray[1];
  const receivingPlayer = usersArray[0];

  expect(
    exchangeResourcesPure(users, sendingPlayer, receivingPlayer, [
      ResourceType.WHEAT,
      ResourceType.WOOD,
    ])
  ).toStrictEqual({
    Gali: {
      resources: {
        ...emptyResources,
        WHEAT: 2,
        WOOD: 1,
      },
      config: {
        color: "blue",
      },
    },
    Kelvin: {
      resources: {
        ...emptyResources,
        WHEAT: 2,
        WOOD: 1,
      },
      config: {
        color: "red",
      },
    },
  });
});
