import { emptyResources } from "../../../../tests/utils";
import { Users } from "../../../../types";
import { checkForUserExistence } from "./checkForUserExistence.general";

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

it("successful check", () => {
  const user = "Kelvin";
  expect(checkForUserExistence(user, users)).toBeUndefined();
});

it("successful failure check", () => {
  const user = "unknown";
  expect(() => checkForUserExistence(user, users)).toThrowError();
});
