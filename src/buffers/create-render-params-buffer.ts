type Bounds = { xMin: number; xMax: number; yMin: number; yMax: number };

type CreateRenderParamsBufferProps = {
  device: GPUDevice;
  params: {
    nx: number;
    ny: number;
    minValue: number;
    maxValue: number;
    viewport: Bounds;
    domain: Bounds;
  };
};

export const createRenderParamsBuffer = ({
  device,
  params,
}: CreateRenderParamsBufferProps) => {
  const buffer = device.createBuffer({
    size: 48, // 2x u32 + 10x f32
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const data = new ArrayBuffer(48);
  const view = new DataView(data);

  view.setUint32(0, params.nx, true);
  view.setUint32(4, params.ny, true);
  view.setFloat32(8, params.minValue, true);
  view.setFloat32(12, params.maxValue, true);

  view.setFloat32(16, params.viewport.xMin, true);
  view.setFloat32(20, params.viewport.yMin, true);
  view.setFloat32(24, params.viewport.xMax, true);
  view.setFloat32(28, params.viewport.yMax, true);

  view.setFloat32(32, params.domain.xMin, true);
  view.setFloat32(36, params.domain.yMin, true);
  view.setFloat32(40, params.domain.xMax, true);
  view.setFloat32(44, params.domain.yMax, true);

  device.queue.writeBuffer(buffer, 0, data);

  return buffer;
};
