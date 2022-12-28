import { createPlayersAndProperties } from "./createPlayersAndProperties.general";

it("creates player with resources", () => {
  const player1 = "Kelvin";
  const playerInitiation = createPlayersAndProperties();

  expect(Object.keys(playerInitiation).length).toBe(4);
  expect(playerInitiation[player1].config).toHaveProperty("color");
  expect(
    Object.values(playerInitiation[player1].resources).some(
      (value) => value > 0
    )
  ).toBeTruthy();
});

it("creates player with empty resources", () => {
  const player1 = "Alex";
  const playerInitiation = createPlayersAndProperties(true);
  expect(Object.keys(playerInitiation).length).toBe(4);
  expect(playerInitiation[player1].config).toHaveProperty("color");
  expect(
    Object.values(playerInitiation[player1].resources).every(
      (value) => value === 0
    )
  ).toBeTruthy();
});
