import { LABELS_Y_SELECTOR_ID } from "../selectors";

const labelsYContainer = document.querySelector(`#${LABELS_Y_SELECTOR_ID}`);

export const createLabelY = (text: string, position: string) => {
  if (!labelsYContainer) {
    console.error("Y labels container aren't found");
    return;
  }

  const label = document.createElement("span");
  label.textContent = text;
  label.style.position = "absolute";

  label.style.right = "5px";
  label.style.bottom = position;
  label.style.transform = "translate(0%, 50%)";

  labelsYContainer.appendChild(label);
};
