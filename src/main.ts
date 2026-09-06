import "./style.css";
import { initRenderPipeline } from "./init-render-pipeline";
import { initWebGPU } from "./init-webgpu";
import {
  DOMAIN,
  initialValue,
  NX,
  NY,
  OMEGA,
  t0,
  VIEWPORT,
} from "./utils/initial-conditions";
import { createRenderBindGroup } from "./create-render-bind-group";
import { createLabelX } from "./helpers/create-label-x";
import { createLabelY } from "./helpers/create-label-y";
import { createValueBuffer } from "./buffers/create-value-buffer";
import { computeMinMax } from "./utils/compute-min-max";
import { createRenderParamsBuffer } from "./buffers/create-render-params-buffer";
import { initCanvas } from "./init-canvas";
import { createComputeParamsBuffer } from "./buffers/create-compute-params-buffer";
import { initComputePipeline } from "./init-compute-pipeline";
import { createComputeBindGroups } from "./create-compute-bind-groups";
import { changeLabelTime } from "./helpers/change-label-time";

async function run() {
  try {
    const { device } = await initWebGPU({
      hasComputePipeline: true,
      requiredSize: NX * NY * 4,
    });
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
      params: {
        nx: NX,
        ny: NY,
        minValue: min,
        maxValue: max,
        viewport: VIEWPORT,
        domain: DOMAIN,
      },
    });

    const renderPipeline = await initRenderPipeline({ device });
    const renderBindGroup = createRenderBindGroup({
      device,
      pipeline: renderPipeline,
      valueBuffer,
      paramsBuffer: renderParamsBuffer,
    });

    const { computeParamsBuffer, TIME_OFFSET } = createComputeParamsBuffer({
      device,
      params: { nx: NX, ny: NY, domain: DOMAIN, omega: OMEGA, t0 },
    });

    const computePipeline = await initComputePipeline({ device });

    const computeBindGroup = createComputeBindGroups({
      device,
      pipeline: computePipeline,
      valueBuffer,
      paramsBuffer: computeParamsBuffer,
    });

    const startTime = performance.now();

    const workgroupsX = Math.ceil(NX / 8);
    const workgroupsY = Math.ceil(NY / 8);

    function frame() {
      const t = (performance.now() - startTime) / 1000 / 2; // секунды с начала работы
      device.queue.writeBuffer(
        computeParamsBuffer,
        TIME_OFFSET,
        new Float32Array([t]),
      );

      const encoder = device.createCommandEncoder();

      const computePass = encoder.beginComputePass();
      computePass.setPipeline(computePipeline);
      computePass.setBindGroup(0, computeBindGroup);
      computePass.dispatchWorkgroups(workgroupsX, workgroupsY);
      computePass.end();

      const renderPass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 255, g: 255, b: 255, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      renderPass.setPipeline(renderPipeline);
      renderPass.setBindGroup(0, renderBindGroup);
      renderPass.draw(3);
      renderPass.end();

      device.queue.submit([encoder.finish()]);

      changeLabelTime(t);
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
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
