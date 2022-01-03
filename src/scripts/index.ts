import { Action } from "../reducer";
import keywords from "../utils/keywords";
import { parseGot, recognizeUsers } from "./actionParser";

// First, delete the ad
function deleteAd() {
  const ad = document.querySelector(".main_container_block_ads_included");
  ad?.remove();
}

/**
 * Wait for players to place initial settlements so we can determine who the players are.
 */
export const watchLog = (
  logElement: HTMLElement,
  dispatch: React.Dispatch<Action>
) => {
  let initialPlacementDone = false;
  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          // Get initial resources and players
          if (!initialPlacementDone) {
            recognizeUsers(node as HTMLElement, dispatch);
            initialPlacementDone =
              node.textContent?.includes(
                keywords.initialPlacementDoneMessage
              ) || false;
          }
          // Check for incoming logs after placement
          else {
            parseGot(node as HTMLElement, dispatch);
            /**
             * parseGotMessage,
             * 
                parseBuiltMessage,
                parseBoughtMessage,
                parseTradeBankMessage,
                parseYearofPlenty,
                parseStoleAllOfMessage,
                parseDiscardedMessage,
                parseTradedMessage,
                parseStoleFromYouMessage,
                parseStoleUnknownMessage,
                reviewTheft
             */
          }
        });
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
export const findTranscription = (dispatch: React.Dispatch<Action>) => {
  let logElement;
  let interval = setInterval(() => {
    if (logElement) {
      clearInterval(interval);
      watchLog(logElement, dispatch);
      deleteAd();
    } else {
      logElement = document.getElementById("game-log-text");
    }
  }, 500);
};
