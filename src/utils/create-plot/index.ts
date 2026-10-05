import { VIEWPORT } from "../initial-conditions";
import { createLabelX } from "./create-label-x";
import { createLabelY } from "./create-label-y";

export default function createPlot() {
  createLabelX(VIEWPORT.xMin.toString(), "0%");
  createLabelX(VIEWPORT.xMax.toString(), "100%");
  createLabelY(VIEWPORT.yMin.toString(), "0%");
  createLabelY(VIEWPORT.yMax.toString(), "100%");
}
