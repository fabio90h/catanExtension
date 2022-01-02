import { Action, ActionType } from "../reducer";
import { ResourceType } from "../types";
import { collectionToArray, imageDataConverter } from "../utils/index.";
import keywords from "../utils/keywords";

/**
 * Log initial resource distributions.
 */
// function tallyInitialResources() {
//   var allMessages = getAllMessages();
//   allMessages.forEach(parseGotMessage);
//   deleteAd();
//   render();
//   startWatchingMessages();
// }

/**
 * Once initial settlements are placed, determine the players.
 */
const recognizeUsers = (
  node: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  if (!node.textContent?.includes(keywords.placeInitialSettlementSnippet))
    return;
  if (node.textContent) {
    console.log("recognizeUsers", node);

    const player = node.textContent
      .replace(keywords.placeInitialSettlementSnippet, "")
      .split(" ")[0];

    const images = collectionToArray(node.getElementsByTagName("img"));

    const startingResources = images.reduce<ResourceType[]>((acc, img) => {
      const imageData = imageDataConverter(img.src);
      if (imageData) return [...acc, imageData];
      return acc;
    }, []);

    dispatch({
      type: ActionType.INITIALIZE_USER,
      payload: { user: player, color: node.style.color, startingResources },
    });
  }
};

// First, delete the ad
function deleteAd() {
  const ad = document.querySelector(".main_container_block_ads_included");
  ad?.remove();
}

// export const loadCounter = () => {
//   setTimeout(() => {
//     recognizeUsers();
//     tallyInitialResources();
//   }, 500); // wait for inital resource distribution to be logged
// }

/**
 * Wait for players to place initial settlements so we can determine who the players are.
 */
export const waitForInitialPlacement = (
  logElement: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  let initialPlacementDone = false;
  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = function (mutationsList, observer) {
    console.log("waitForInitialPlacement");
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          recognizeUsers(node as HTMLElement, dispatch);
          initialPlacementDone =
            node.textContent?.includes(keywords.initialPlacementDoneMessage) ||
            false;
        });

        if (initialPlacementDone) {
          deleteAd();
          // loadCounter();
          observer.disconnect();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(logElement, config);
};

/**
 * Find the transcription.
 */
export const findTranscription = (
  setFoundTranscription: (value: React.SetStateAction<boolean>) => void,
  dispatch: React.Dispatch<Action>
) => {
  let logElement;
  let interval = setInterval(() => {
    if (logElement) {
      clearInterval(interval);
      setFoundTranscription(true);
      waitForInitialPlacement(logElement, dispatch);
    } else {
      logElement = document.getElementById("game-log-text");
    }
  }, 500);
};
