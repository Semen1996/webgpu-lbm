import { TIME_VALUE_SELECTOR_ID } from "@/utils/selectors";

const timeValueSelector = document.querySelector(`#${TIME_VALUE_SELECTOR_ID}`);

export function changeLabelTime(value: number) {
  if (!timeValueSelector) {
    console.error("timeValueSelector isn't found");
    return;
  }

  timeValueSelector.textContent = value.toFixed(1);
}
