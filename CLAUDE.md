# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A WebGPU Lattice Boltzmann (D2Q9, BGK) simulation of the 2D lid-driven cavity flow, rendered as a velocity-magnitude heatmap in the browser. It's a port of a MATLAB reference implementation, and the shader comments often refer back to it (MATLAB indices `k=1..9` map to `0..8` here). Comments are mostly in Russian.

## Commands

- `npm run dev` starts the Vite dev server. It needs a WebGPU-capable browser.
- `npm run build` runs `tsc` (type-check only, `noEmit`) and then `vite build`.
- `npm run preview` serves the built output.

There are no tests and no linter. `tsc` with `noUnusedLocals` and `noUnusedParameters` is the only static check.

## Architecture

The entry point is `src/main.ts`. It sets up all GPU resources and runs the simulation loop. The other modules are small factory functions, one per file, with the naming pattern `create-*-buffer.ts`, `create-*-bind-group.ts` and `init-*-pipeline.ts`. Each takes a single props object.

**Simulation parameters** live in `src/utils/initial-conditions.ts`: grid size `NX`/`NY`, lid velocity `U0`, and target Reynolds number. `OMEGA` is derived from these values. `VIEWPORT`/`DOMAIN` map the grid onto the plot area.

**Data layout**
- Distribution functions `f` are stored as a flat `f32` array indexed `(j * nx + i) * 9 + k`. Here `j=0` is the bottom row and `j=ny-1` is the moving lid at the top.
- The D2Q9 direction order is E, N, W, S, NE, NW, SW, SE, C. The direction constants, `cx`/`cy`/`w`, the `Params` struct and `fIndex` live in `src/shaders/compute/common.wgsl`. `init-lbm-pipelines.ts` prepends that file to every compute shader, so don't redeclare these names in individual shaders.
- Macroscopic fields `rho`, `u` and `v` are separate `nx*ny` `f32` buffers. They are initialized in `create-macro-buffers.ts`, with `u = U0` on the top row. The `f` buffers start at zero, because the first collide step computes `feq` from `rho`/`u`/`v`.

**One LBM step** is two compute dispatches in `src/shaders/compute/`, both `@workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)`. `WORKGROUP_SIZE` is an `override` declared in `common.wgsl`, and its value comes from the TS constant in `init-lbm-pipelines.ts` via `constants`. `main.ts` uses the same TS constant to compute the dispatch size, so change it only in TS:
1. `collide-stream.wgsl` pulls from `fOld` and writes `fNew`. For each direction it computes `feq` from the *source* cell's `rho`/`u`/`v` and collides in the same pass. The pull uses periodic wrap; the next pass overrides the edges.
2. `boundary-macroscopic.wgsl` reads each cell's 9 values of the freshly written `f` once. It applies bounce-back on the left, right and bottom walls, and a Zou/He-style moving lid on the top row (interior nodes only). It writes `f` back for boundary cells only, then recomputes `rho`, `u` and `v` from the same local values. The order of overwrites deliberately mirrors the MATLAB code, and the top row uses a special density formula.

**Ping-pong buffers:** `main.ts` keeps the two `f` buffers in `fBuffers` and builds a matching array of bind groups for each pipeline. `collideStreamBindGroups[i]` reads `fBuffers[i]` (`fSrc`) and writes the other buffer (`fDst`); `boundaryMacroscopicBindGroups[i]` works in place on `fBuffers[i]`. `fSrcIndex` is the index of the buffer holding fresh data. It flips right after collide-stream, so boundary-macroscopic binds to the buffer that was just written.

**Loop:** each `requestAnimationFrame` runs `runBatch()`, which executes `STEPS_PER_BATCH` steps and then draws one frame. The steps are submitted in chunks of `CHUNK_SIZE`, and the loop awaits `onSubmittedWorkDone()` after *every* chunk. Those gaps are what let the OS compositor and other apps use the GPU. A single await per batch (all chunks queued back to back) was tried and froze the whole system once `STEPS_PER_BATCH` was large, so keep the per-chunk await. `CHUNK_SIZE` sets how long the GPU is held at a time, and `STEPS_PER_BATCH` only sets how often a frame is drawn.

**Rendering:** `lbm-render.wgsl` draws a fullscreen triangle with `draw(3)`. It maps fragment UV to world space through `VIEWPORT`, discards fragments outside `DOMAIN`, samples `u`/`v` at the nearest grid cell, and colors `|u|/U0` with a 4-stop colormap. The axis labels and time label are plain DOM elements (`src/utils/create-plot/`) positioned around the `#gfx-main` canvas in `index.html`.

## Conventions and gotchas

- WGSL is imported as a string with `import shader from "@/shaders/....wgsl?raw"`. The `@` alias points to `src/` and is configured in both `vite.config.ts` and `tsconfig.json`.
- Uniform buffers are packed by hand with `DataView` using explicit byte offsets. If a WGSL `Params` struct changes, update the matching `create-*-params-buffer.ts` too, and respect WGSL alignment. `lbm-render` puts its `vec2` fields first and the scalars last, so no explicit `_pad` field is needed; keep that order when adding fields. The compute shaders share the 16-byte `Params` struct from `common.wgsl`.
- Pipelines use `layout: "auto"`, so bind group entries must match the `@binding` indices that the shader actually uses.
- `main.ts` passes `requiredSize: NX * NY * 4` to `initWebGPU`. That is the size of a macro buffer, but the largest binding is an `f` buffer at `NX*NY*9*4` bytes. It works at the current grid size only because the default limit is large enough. When scaling up the grid, pass the `f` buffer size instead.
