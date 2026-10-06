import type { ViewConfig } from "@/config";
import { createAxisLabel } from "./create-axis-label";

export default function createPlot({ viewport }: ViewConfig) {
  createAxisLabel("x", viewport.xMin.toString(), "0%");
  createAxisLabel("x", viewport.xMax.toString(), "100%");
  createAxisLabel("y", viewport.yMin.toString(), "0%");
  createAxisLabel("y", viewport.yMax.toString(), "100%");
}
