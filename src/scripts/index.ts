/* eslint-disable no-loop-func */
import { Action } from "../reducer";
import keywords from "../utils/keywords";

import { parseBankTrade } from "./actions/parseBankTrade/parseBankTrade.action";
import { parseDiscardMessage } from "./actions/parseDiscardMessage/parseDiscardMessage.action";

import { parseGot } from "./actions/parseGot/parseGot.actions";
import { parseMonoplyCard } from "./actions/parseMonoplyCard/parseMonoplyCard.action";
import { parsePlayersTrade } from "./actions/parsePlayerTrade/parsePlayerTrade.actions";
import { parsePurchase } from "./actions/parsePurchase/parsePurchase.actions";
import { parsePurposalMessage } from "./actions/parsePurposalMessage/parsePurposalMessage.action";
import { parseRecognizeUsers } from "./actions/parseRecognizeUsers/parseRecognizeUsers.actions";
import { parseStoleFromYouMessage } from "./actions/parseStoleFromYouMessage/parseStoleFromYouMessage.action";
import { parseStoleUnknownMessage } from "./actions/parseStoleUnknownMessage/parseStoleUnknownMessage.action";
import { parseYearOfPlenty } from "./actions/parseYearOfPlenty/parseYearOfPlenty.actions";

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
            parseRecognizeUsers(node as HTMLElement, dispatch);
            initialPlacementDone =
              node.textContent?.includes(
                keywords.initialPlacementDoneMessage
              ) || false;
          }
          // Check for incoming logs after placement
          else {
            // Player got resources
            if (parseGot(node as HTMLElement, dispatch)) return;
            // Player bought something
            else if (parsePurchase(node as HTMLElement, dispatch)) return;
            else if (parseBankTrade(node as HTMLElement, dispatch)) return;
            else if (parsePlayersTrade(node as HTMLElement, dispatch)) return;
            else if (
              parseMonoplyCard(
                node as HTMLElement,
                mutation.previousSibling as HTMLElement,
                dispatch
              )
            )
              return;
            else if (parseYearOfPlenty(node as HTMLElement, dispatch)) return;
            else if (parseDiscardMessage(node as HTMLElement, dispatch)) return;
            else if (parseStoleFromYouMessage(node as HTMLElement, dispatch))
              return;
            else if (parseStoleUnknownMessage(node as HTMLElement, dispatch))
              return;
            else if (parsePurposalMessage(node as HTMLElement, dispatch))
              return;
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
