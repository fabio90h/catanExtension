export default {
  userName: "Fabio#2871", //userName

  initialPlacementDoneMessage: "rolled:",

  //Deal
  proposal: " wants to give:",
  wants: "for:",

  //Receiving
  placeInitialSettlementSnippet: "received starting resources:",
  receivedResourcesSnippet: "got:",

  //Spending
  builtSnippet: "built a",
  boughtSnippet: " bought ",

  //Trade with bank
  tradeBankGaveSnippet: "gave bank:",
  tradeBankTookSnippet: "and took",

  //Development Cards
  stoleAllOfSnippet: "used Monopoly",
  yearOfPlenty: " took from bank",

  //Discard
  discardedSnippet: "discarded",

  //Trade
  tradedWithSnippet: " traded:",
  tradeEnd: "for: ",
  tradeAgreePlayer: "with: ",
  //  tradeWantsToGiveSnippet : "wants to give:",
  //  tradeGiveForSnippet : "for:",

  //Steal
  stoleFromYouSnippet: " stole:   from ",
  youStoleFromSnippet: " stole:   from: ",
  stoleFromSnippet: " stole   from: ", // extra space from icon

  //Resource
  unknown: "card_rescardback",
  wood: "card_lumber",
  stone: "card_ore",
  wheat: "card_grain",
  brick: "card_brick",
  sheep: "card_wool",

  //Build
  road: "road",
  settlement: "settlement",
  city: "city",

  // Players
  players: [],
  player_colors: {}, // player -> hex

  // Per player per resource
  resources: {},

  // Thefts - transactions from when the robber is placed and stolen resource is unknown
  thefts: [],
  // Thefts - once the unknown resources are accounted for
  solved_thefts: [],
};
