import "./style.css";
import { initRenderPipeline } from "./init-render-pipeline";
import { initWebGPU } from "./init-webgpu";
import { initialValue, NX, NY, VIEWPORT } from "./utils/initial-conditions";
import { createRenderBindGroups } from "./createRenderBindGroups";
import { createLabelX } from "./helpers/create-label-x";
import { createLabelY } from "./helpers/create-label-y";
import { createValueBuffer } from "./buffers/create-value-buffer";
import { computeMinMax } from "./utils/compute-min-max";
import { createRenderParamsBuffer } from "./buffers/create-render-params-buffer";
import { initCanvas } from "./init-canvas";
import { render } from "./render";

async function run() {
  try {
    const { device } = await initWebGPU();
    const { context } = initCanvas({
      device,
      canvasSelector: "#gfx-main",
    });

    const valueBuffer = createValueBuffer({
      device,
      initialValue,
    });

    const { min, max } = computeMinMax(initialValue);

    const renderParamsBuffer = createRenderParamsBuffer({
      device,
      params: { nx: NX, ny: NY, minValue: min, maxValue: max },
    });

    const renderPipeline = await initRenderPipeline({ device });
    const renderBindGroup = createRenderBindGroups({
      device,
      pipeline: renderPipeline,
      valueBuffer,
      paramsBuffer: renderParamsBuffer,
    });

    render({
      device,
      context,
      pipeline: renderPipeline,
      bindGroup: renderBindGroup,
    });
  } catch (error) {
    console.error(error);
  }
}

function createPlot() {
  createLabelX(VIEWPORT.xMin.toString(), "0%");
  createLabelX(VIEWPORT.xMax.toString(), "100%");
  createLabelY(VIEWPORT.yMin.toString(), "0%");
  createLabelY(VIEWPORT.yMax.toString(), "100%");
}

createPlot();
run();
