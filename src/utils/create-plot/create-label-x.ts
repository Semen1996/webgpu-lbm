import { LABELS_X_SELECTOR_ID } from "../selectors";

const labelsXContainer = document.querySelector(`#${LABELS_X_SELECTOR_ID}`);

export const createLabelX = (text: string, position: string) => {
  if (!labelsXContainer) {
    console.error("X labels container aren't found");
    return;
  }

  const label = document.createElement("span");
  label.textContent = text;
  label.style.position = "absolute";

  label.style.left = position;
  label.style.top = "5px";
  label.style.transform = "translate(-50%, 0%)";

  labelsXContainer.appendChild(label);
};
