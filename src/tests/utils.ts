import { Action } from "../reducer";
import {
  parseBankTrade,
  parseDiscardedMessage,
  parseGot,
  parseMonoplyCard,
  parsePlayersTrade,
  parsePurchase,
  parseStoleFromYouMessage,
  parseStoleUnknownMessage,
  parseYearofPlenty,
  recognizeUsers,
} from "../scripts/actionParser";
import {
  PurchaseType,
  ResourceType,
  UserConfig,
  UserResources,
  Users,
} from "../types";
import { getImg } from "../utils/index.";
import keywords from "../utils/keywords";
import data from "./data";
import testData from "./data";

type UserProperties = {
  resources: UserResources;
  config: UserConfig;
};

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export const getRandomArbitrary = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const shuffleArray = <T>(array: Array<T>) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const getRandomResources = (amount: number = 9) => {
  const gainedResources: ResourceType[] = [];
  const resourceAmount = getRandomArbitrary(1, amount);
  for (let i = 0; i < resourceAmount; i++) {
    const randomIndex = getRandomArbitrary(0, testData.resources.length);
    gainedResources.push(testData.resources[randomIndex]);
  }

  return gainedResources;
};

const startingResourcesAndConfig: UserProperties[] = [
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 2,
    },
    config: { color: "rgb(224, 151, 66)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 1,
      [ResourceType.SHEEP]: 1,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(102, 102, 102)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 1,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 2,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(226, 113, 116)" },
  },
  {
    resources: {
      [ResourceType.WOOD]: 2,
      [ResourceType.WHEAT]: 0,
      [ResourceType.BRICK]: 0,
      [ResourceType.SHEEP]: 0,
      [ResourceType.STONE]: 0,
    },
    config: { color: "rgb(34, 54, 151)" },
  },
];

export const emptyResources = {
  [ResourceType.WOOD]: 0,
  [ResourceType.WHEAT]: 0,
  [ResourceType.BRICK]: 0,
  [ResourceType.SHEEP]: 0,
  [ResourceType.STONE]: 0,
};

export const createPlayersAndProperties = (
  allResourceStartEmpty: boolean = false
) => {
  const shuffledStartingResourcesAndConfig = shuffleArray<UserProperties>(
    startingResourcesAndConfig
  );
  return testData.users.reduce<Users>((acc, user, index) => {
    acc[user] = shuffledStartingResourcesAndConfig[index];
    if (allResourceStartEmpty) {
      acc[user].resources = emptyResources;
    }
    return acc;
  }, {});
};

export const createDivElement = (
  color: string,
  user1: string,
  keywords: string,
  user2?: string
) => {
  const node = document.createElement("div");
  node.textContent = `${user1} ${keywords} ${user2 ? user2 : ""}`;
  node.style.color = color;
  return node;
};

export const createChildImgElement = (
  node: HTMLElement,
  imageType: ResourceType | PurchaseType
) => {
  const img = document.createElement("img");
  img.setAttribute("src", getImg(imageType));
  node.appendChild(img);
  return node;
};

export const initiateTestingPlayers = (
  dipatch: React.Dispatch<Action>,
  allResourceStartEmpty: boolean = false
) => {
  const users = createPlayersAndProperties(allResourceStartEmpty);

  (Object.keys(users) as Array<keyof typeof users>).forEach((user) => {
    const node = createDivElement(
      users[user].config.color,
      user,
      keywords.placeInitialSettlementSnippet
    );

    (Object.keys(users[user].resources) as Array<ResourceType>).forEach(
      (resource) => {
        if (users[user].resources[resource] > 0)
          for (
            let index = 0;
            index < users[user].resources[resource];
            index++
          ) {
            createChildImgElement(node, resource);
          }
      }
    );

    recognizeUsers(node, dipatch);
  });
};

export const giveResourcesToPlayer = (
  dipatch: React.Dispatch<Action>,
  user: string,
  addedResouces: ResourceType[],
  userResources: UserResources,
  color: string
) => {
  const tempResources = { ...userResources };
  const node = createDivElement(color, user, keywords.receivedResourcesSnippet);
  addedResouces.forEach((resource) => {
    createChildImgElement(node, resource);
    tempResources[resource] += 1;
  });

  parseGot(node, dipatch);
  return tempResources;
};

export const playerMakesPurchase = (
  dipatch: React.Dispatch<Action>,
  user: string,
  purchaseType: PurchaseType,
  userResources: UserResources,
  color: string
) => {
  const tempResources = { ...userResources };
  const node = createDivElement(
    color,
    user,
    purchaseType === PurchaseType.DEVELOPMENT
      ? keywords.boughtSnippet
      : keywords.builtSnippet
  );

  testData.purchase[purchaseType].forEach((resource) => {
    tempResources[resource] -= 1;
  });
  createChildImgElement(node, purchaseType);

  //   // Guard to make sure that are no negatives in the resource
  //   if (
  //     Object.values(tempResources).every((resourceAmount) => resourceAmount >= 0)
  //   ) {
  parsePurchase(node, dipatch);
  //   }
  return tempResources;
};

export const bankTrade = (
  dispatch: React.Dispatch<Action>,
  user: string,
  gave: ResourceType[],
  took: ResourceType[],
  userResources: UserResources,
  color: string
) => {
  const tempResources = { ...userResources };

  const node = createDivElement(color, user, keywords.tradeBankGaveSnippet);

  gave.forEach((resource) => {
    createChildImgElement(node, resource);
    tempResources[resource] -= 1;
  });

  const textNode = document.createTextNode(keywords.tradeBankTookSnippet);
  node.appendChild(textNode);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
    tempResources[resource] += 1;
  });

  parseBankTrade(node, dispatch);
  return tempResources;
};

export const playerTrade = (
  dispatch: React.Dispatch<Action>,
  offeringPlayer: string,
  agreedPlayer: string,
  gave: ResourceType[],
  took: ResourceType[],
  color: string
) => {
  const node = createDivElement(
    color,
    offeringPlayer,
    keywords.tradedWithSnippet
  );

  gave.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeEnd = document.createTextNode(`${keywords.tradeEnd} `);
  node.appendChild(textNodeEnd);

  took.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  const textNodeAgree = document.createTextNode(
    `${keywords.tradeAgreePlayer} ${agreedPlayer}`
  );
  node.appendChild(textNodeAgree);

  parsePlayersTrade(node, dispatch);
};

export const monopoly = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  monopolizedResource: ResourceType,
  amountStolen: number
) => {
  const prevNode = createDivElement(color, player, keywords.stoleAllOfSnippet);

  const node = createDivElement(color, player, keywords.monoplyStole);

  createChildImgElement(node, monopolizedResource);

  const textNodeAgree = document.createTextNode(` ${amountStolen}`);
  node.appendChild(textNodeAgree);

  parseMonoplyCard(node, prevNode, dispatch);
};

export const yearOfPlenty = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  pickedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.yearOfPlenty);

  pickedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseYearofPlenty(node, dispatch);
};

export const discardCards = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  discardedResources: ResourceType[]
) => {
  const node = createDivElement(color, player, keywords.discardedSnippet);

  discardedResources.forEach((resource) => {
    createChildImgElement(node, resource);
  });

  parseDiscardedMessage(node, dispatch);
};

export const stoleFromOrByYou = (
  dispatch: React.Dispatch<Action>,
  player: string,
  color: string,
  stolenResource: ResourceType,
  isYouTheStealer: boolean = false
) => {
  const node = createDivElement(
    color,
    isYouTheStealer ? "You" : player,
    isYouTheStealer
      ? keywords.youStoleFromSnippet
      : keywords.stoleFromYouSnippet
  );

  createChildImgElement(node, stolenResource);

  const textNodeAgree = document.createTextNode(
    `${isYouTheStealer ? player : "you"}`
  );
  node.appendChild(textNodeAgree);

  parseStoleFromYouMessage(node, dispatch);
};

export const unknownSteal = (
  dispatch: React.Dispatch<Action>,
  victim: string,
  stealer: string,
  color: string
) => {
  const node = createDivElement(
    color,
    stealer,
    `${keywords.stoleFromSnippet}`,
    victim
  );

  parseStoleUnknownMessage(node, dispatch);
};
