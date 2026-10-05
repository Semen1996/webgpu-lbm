import { VIEWPORT } from "../initial-conditions";
import { createAxisLabel } from "./create-axis-label";

export default function createPlot() {
  createAxisLabel("x", VIEWPORT.xMin.toString(), "0%");
  createAxisLabel("x", VIEWPORT.xMax.toString(), "100%");
  createAxisLabel("y", VIEWPORT.yMin.toString(), "0%");
  createAxisLabel("y", VIEWPORT.yMax.toString(), "100%");
}
