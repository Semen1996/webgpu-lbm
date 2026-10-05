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
import { initLbmPipelines } from "./pipeline/init-lbm-pipelines";
import { createLbmRenderParamsBuffer } from "./buffers/create-lbm-render-params-buffer";
import { initLbmRenderPipeline } from "./pipeline/init-lbm-render-pipeline";
import { createLbmRenderBindGroup } from "./bind-groups/create-lbm-render-bind-group";
import createPlot from "./utils/create-plot";
import { createCollideStreamBindGroup } from "./bind-groups/compute/create-collide-stream-bind-group";
import { createBoundaryMacroscopicBindGroup } from "./bind-groups/compute/create-boundary-macroscopic-bind-group";
import { renderFrame } from "./render-frame";

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

    const lbmRenderParamsBuffer = createLbmRenderParamsBuffer({
      device,
      params: { nx: NX, ny: NY, u0: U0, viewport: VIEWPORT, domain: DOMAIN },
    });

    const lbmRenderPipeline = await initLbmRenderPipeline({ device });

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

    const workgroupsX = Math.ceil(NX / 8);
    const workgroupsY = Math.ceil(NY / 8);

    const cellCount = NX * NY;
    const uStaging = device.createBuffer({
      size: cellCount * 4,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    const vStaging = device.createBuffer({
      size: cellCount * 4,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    let fSrcIndex = 0; // индекс буфера в fBuffers со свежими f

    const MAX_ITERATIONS = 100000; // с запасом под более медленную сходимость
    const STEPS_PER_BATCH = 100;
    const CHUNK_SIZE = 20; // сколько LBM-шагов в одном submit — подберите экспериментально

    let previousErs = 0.0;
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

        // ключевая строка: ждём завершения ИМЕННО этого куска перед следующим
        await device.queue.onSubmittedWorkDone();

        stepsRemaining -= chunkSteps;
      }

      // readback для проверки сходимости — после ВСЕХ чанков батча, как и раньше
      const encoder = device.createCommandEncoder();
      encoder.copyBufferToBuffer(uBuffer, 0, uStaging, 0, cellCount * 4);
      encoder.copyBufferToBuffer(vBuffer, 0, vStaging, 0, cellCount * 4);
      device.queue.submit([encoder.finish()]);

      await uStaging.mapAsync(GPUMapMode.READ);
      await vStaging.mapAsync(GPUMapMode.READ);
      const uData = new Float32Array(uStaging.getMappedRange().slice(0));
      const vData = new Float32Array(vStaging.getMappedRange().slice(0));
      uStaging.unmap();
      vStaging.unmap();

      let ers = 0;
      for (let idx = 0; idx < cellCount; idx++) {
        ers += uData[idx] * uData[idx] + vData[idx] * vData[idx];
      }

      const error = Math.abs(ers - previousErs) / cellCount;
      previousErs = ers;
      return error;
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
