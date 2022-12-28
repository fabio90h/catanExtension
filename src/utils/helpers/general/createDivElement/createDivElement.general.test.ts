import keywords from "../../../keywords";
import { createDivElement } from "./createDivElement.general";

it("should correctly create a div node without user2", () => {
  const color = "blue";
  const user1 = "alex";
  const stoleAllOfSnippet = keywords.stoleAllOfSnippet;

  const node = createDivElement(color, user1, stoleAllOfSnippet);
  expect(node.outerHTML).toBe(
    '<div style="color: blue;">alex used Monopoly </div>'
  );
});

it("should correctly create a div node with user2", () => {
  const color = "blue";
  const user1 = "alex";
  const stoleAllOfSnippet = keywords.stoleFromSnippet;
  const user2 = "gali";

  const node = createDivElement(color, user1, stoleAllOfSnippet, user2);
  expect(node.outerHTML).toBe(
    '<div style="color: blue;">alex  stole   from:  gali</div>'
  );
});
