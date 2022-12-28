/**
 * Simulates the output of each log
 * @param color
 * @param user1
 * @param keywords
 * @param user2
 * @returns
 */
export const createDivElement = (
  color: string,
  user1: string,
  keywords: string,
  user2?: string
) => {
  const node = document.createElement("div");
  node.textContent = `${user1} ${keywords} ${user2 ?? ""}`;
  node.style.color = color;
  return node;
};
