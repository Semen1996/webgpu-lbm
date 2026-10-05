type Bounds = { xMin: number; xMax: number; yMin: number; yMax: number };

type CreateLbmRenderParamsBufferProps = {
  device: GPUDevice;
  params: {
    nx: number;
    ny: number;
    u0: number;
    viewport: Bounds;
    domain: Bounds;
  };
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

  view.setUint32(0, params.nx, true);
  view.setUint32(4, params.ny, true);
  view.setFloat32(8, params.u0, true);
  view.setFloat32(12, 0, true); // паддинг до 16 байт (выравнивание vec2)

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
