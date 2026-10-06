import type { SimulationConfig, ViewConfig } from "@/config";

type CreateLbmRenderParamsBufferProps = {
  device: GPUDevice;
  params: Pick<SimulationConfig, "nx" | "ny" | "u0"> & ViewConfig;
};

export const createLbmRenderParamsBuffer = ({
  device,
  params,
}: CreateLbmRenderParamsBufferProps) => {
  const buffer = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const data = new ArrayBuffer(48);
  const view = new DataView(data);

  view.setFloat32(0, params.viewport.xMin, true);
  view.setFloat32(4, params.viewport.yMin, true);
  view.setFloat32(8, params.viewport.xMax, true);
  view.setFloat32(12, params.viewport.yMax, true);

  view.setFloat32(16, params.domain.xMin, true);
  view.setFloat32(20, params.domain.yMin, true);
  view.setFloat32(24, params.domain.xMax, true);
  view.setFloat32(28, params.domain.yMax, true);

  view.setUint32(32, params.nx, true);
  view.setUint32(36, params.ny, true);
  view.setFloat32(40, params.u0, true);
  // 44..48 — хвост структуры до кратности 8 (выравнивание vec2), не пишем

  device.queue.writeBuffer(buffer, 0, data);

  return buffer;
};
