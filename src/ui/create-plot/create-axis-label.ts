import { LABELS_X_SELECTOR_ID, LABELS_Y_SELECTOR_ID } from "@/utils/selectors";

type Axis = "x" | "y";

const AXIS_CONFIG = {
  x: {
    containerId: LABELS_X_SELECTOR_ID,
    applyPosition: (label: HTMLElement, position: string) => {
      label.style.left = position;
      label.style.top = "5px";
      label.style.transform = "translate(-50%, 0%)";
    },
  },
  y: {
    containerId: LABELS_Y_SELECTOR_ID,
    applyPosition: (label: HTMLElement, position: string) => {
      label.style.right = "5px";
      label.style.bottom = position;
      label.style.transform = "translate(0%, 50%)";
    },
  },
} as const;

export const createAxisLabel = (axis: Axis, text: string, position: string) => {
  const { containerId, applyPosition } = AXIS_CONFIG[axis];

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`${axis.toUpperCase()} labels container isn't found`);
    return;
  }

  const label = document.createElement("span");
  label.textContent = text;
  label.style.position = "absolute";
  applyPosition(label, position);

  container.appendChild(label);
};
