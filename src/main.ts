import "./style.css";
import { initWebGPU } from "./init-webgpu";
import {
  DOMAIN,
  NX,
  NY,
  OMEGA,
  U0,
  VIEWPORT,
} from "./utils/initial-conditions";

import { initCanvas } from "./init-canvas";
import { createFBuffer } from "./buffers/compute/create-f-buffer";
import { createMacroBuffers } from "./buffers/compute/create-macro-buffers";
import { createLbmParamsBuffer } from "./buffers/compute/create-lbm-params-buffer";
import {
  initLbmPipelines,
  WORKGROUP_SIZE,
} from "./pipeline/init-lbm-pipelines";
import { createLbmRenderParamsBuffer } from "./buffers/create-lbm-render-params-buffer";
import { initLbmRenderPipeline } from "./pipeline/init-lbm-render-pipeline";
import { createLbmRenderBindGroup } from "./bind-groups/create-lbm-render-bind-group";
import createPlot from "./utils/create-plot";
import { createCollideStreamBindGroup } from "./bind-groups/compute/create-collide-stream-bind-group";
import { createBoundaryMacroscopicBindGroup } from "./bind-groups/compute/create-boundary-macroscopic-bind-group";
import { renderFrame } from "./render-frame";
import { CANVAS_SELECTOR_ID } from "./utils/selectors";

async function run() {
  try {
    const { device } = await initWebGPU({
      hasComputePipeline: true,
      requiredSize: NX * NY * 4,
    });

    const { context, format } = initCanvas({
      device,
      canvasSelector: CANVAS_SELECTOR_ID,
    });

    const lbmRenderParamsBuffer = createLbmRenderParamsBuffer({
      device,
      params: { nx: NX, ny: NY, u0: U0, viewport: VIEWPORT, domain: DOMAIN },
    });

    const lbmRenderPipeline = await initLbmRenderPipeline({ device, format });

    // ping-pong: в одном буфере свежие f, в другой пишет collide-stream
    const fBuffers = [
      createFBuffer({ device, nx: NX, ny: NY }),
      createFBuffer({ device, nx: NX, ny: NY }),
    ];

    const { rhoBuffer, uBuffer, vBuffer } = createMacroBuffers({
      device,
      nx: NX,
      ny: NY,
      u0: U0,
    });

    const lbmParamsBuffer = createLbmParamsBuffer({
      device,
      params: { nx: NX, ny: NY, omega: OMEGA, u0: U0 },
    });

    const renderBindGroup = createLbmRenderBindGroup({
      device,
      pipeline: lbmRenderPipeline,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmRenderParamsBuffer,
    });

    const { collideStreamPipeline, boundaryMacroscopicPipeline } =
      await initLbmPipelines({ device });

    // collideStreamBindGroups[i]: читает fBuffers[i], пишет в другой буфер
    const collideStreamBindGroups = fBuffers.map((fSrcBuffer, i) =>
      createCollideStreamBindGroup({
        device,
        collideStreamPipeline,
        fSrcBuffer,
        fDstBuffer: fBuffers[1 - i],
        rhoBuffer,
        uBuffer,
        vBuffer,
        paramsBuffer: lbmParamsBuffer,
      }),
    );

    // boundaryMacroscopicBindGroups[i]: работает на месте с fBuffers[i]
    const boundaryMacroscopicBindGroups = fBuffers.map((fBuffer) =>
      createBoundaryMacroscopicBindGroup({
        device,
        boundaryMacroscopicPipeline,
        fBuffer,
        rhoBuffer,
        uBuffer,
        vBuffer,
        paramsBuffer: lbmParamsBuffer,
      }),
    );

    const workgroupsX = Math.ceil(NX / WORKGROUP_SIZE);
    const workgroupsY = Math.ceil(NY / WORKGROUP_SIZE);

    let fSrcIndex = 0; // индекс буфера в fBuffers со свежими f

    const MAX_ITERATIONS = 50000; // с запасом под более медленную сходимость
    const STEPS_PER_BATCH = 100; // шагов между отрисовками кадра
    const CHUNK_SIZE = 20; // шагов в одном submit; если система тормозит — уменьшить

    let iteration = 0;

    function draw() {
      renderFrame({
        device,
        context,
        renderPipeline: lbmRenderPipeline,
        renderBindGroup,
      });
    }

    async function runBatch() {
      let stepsRemaining = STEPS_PER_BATCH;

      while (stepsRemaining > 0) {
        const chunkSteps = Math.min(CHUNK_SIZE, stepsRemaining);

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();

        for (let step = 0; step < chunkSteps; step++) {
          pass.setPipeline(collideStreamPipeline);
          pass.setBindGroup(0, collideStreamBindGroups[fSrcIndex]);
          pass.dispatchWorkgroups(workgroupsX, workgroupsY);

          fSrcIndex = 1 - fSrcIndex;

          pass.setPipeline(boundaryMacroscopicPipeline);
          pass.setBindGroup(0, boundaryMacroscopicBindGroups[fSrcIndex]);
          pass.dispatchWorkgroups(workgroupsX, workgroupsY);

          iteration++;
        }

        pass.end();
        device.queue.submit([encoder.finish()]);
        // ждём каждый чанк: в паузе GPU успевает обслужить композитор и другие приложения
        await device.queue.onSubmittedWorkDone();

        stepsRemaining -= chunkSteps;
      }
    }

    async function loop() {
      await runBatch();
      draw();

      if (iteration < MAX_ITERATIONS) {
        requestAnimationFrame(() => loop());
      }
    }

    loop();
  } catch (error) {
    console.error(error);
  }
}

createPlot();
run();
