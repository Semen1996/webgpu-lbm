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
import { createFBuffers } from "./buffers/compute/create-f-buffers";
import { createMacroBuffers } from "./buffers/compute/create-macro-buffers";
import { createLbmParamsBuffer } from "./buffers/compute/create-lbm-params-buffer";
import { initLbmPipelines } from "./pipeline/init-lbm-pipelines";
import { createLbmRenderParamsBuffer } from "./buffers/create-lbm-render-params-buffer";
import { initLbmRenderPipeline } from "./pipeline/init-lbm-render-pipeline";
import { createLbmRenderBindGroup } from "./bind-groups/create-lbm-render-bind-group";
import createPlot from "./utils/create-plot";
import { createCollideStreamBindGroup } from "./bind-groups/compute/create-collide-stream-bind-group";
import { createBoundaryBindGroup } from "./bind-groups/compute/create-boundary-bind-group";
import { createMacroscopicBindGroup } from "./bind-groups/compute/create-macroscopic-bind-group";
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

    const fABuffer = createFBuffers({ device, nx: NX, ny: NY });
    const fBBuffer = createFBuffers({ device, nx: NX, ny: NY });

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

    const { renderBindGroup } = createLbmRenderBindGroup({
      device,
      pipeline: lbmRenderPipeline,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmRenderParamsBuffer,
    });

    const { collideStreamPipeline, boundaryPipeline, macroscopicPipeline } =
      await initLbmPipelines({ device });

    const collideStreamABindGroup = createCollideStreamBindGroup({
      device,
      collideStreamPipeline,
      fABuffer,
      fBBuffer,
      rhoBuffer,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmParamsBuffer,
    });

    const collideStreamBBindGroup = createCollideStreamBindGroup({
      device,
      collideStreamPipeline,
      fABuffer: fBBuffer,
      fBBuffer: fABuffer,
      rhoBuffer,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmParamsBuffer,
    });

    const boundaryABindGroup = createBoundaryBindGroup({
      device,
      boundaryPipeline,
      fBuffer: fABuffer,
      paramsBuffer: lbmParamsBuffer,
    });

    const boundaryBBindGroup = createBoundaryBindGroup({
      device,
      boundaryPipeline,
      fBuffer: fBBuffer,
      paramsBuffer: lbmParamsBuffer,
    });

    const macroscopicABindGroup = createMacroscopicBindGroup({
      device,
      macroscopicPipeline,
      fBuffer: fABuffer,
      rhoBuffer,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmParamsBuffer,
    });

    const macroscopicBBindGroup = createMacroscopicBindGroup({
      device,
      macroscopicPipeline,
      fBuffer: fBBuffer,
      rhoBuffer,
      uBuffer,
      vBuffer,
      paramsBuffer: lbmParamsBuffer,
    });

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

    let currentIsA = true; // true: свежие данные сейчас в fA

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
          pass.setBindGroup(
            0,
            currentIsA ? collideStreamABindGroup : collideStreamBBindGroup,
          );
          pass.dispatchWorkgroups(workgroupsX, workgroupsY);

          currentIsA = !currentIsA;

          pass.setPipeline(boundaryPipeline);
          pass.setBindGroup(
            0,
            currentIsA ? boundaryABindGroup : boundaryBBindGroup,
          );
          pass.dispatchWorkgroups(workgroupsX, workgroupsY);

          pass.setPipeline(macroscopicPipeline);
          pass.setBindGroup(
            0,
            currentIsA ? macroscopicABindGroup : macroscopicBBindGroup,
          );
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
