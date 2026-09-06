type Bounds = { xMin: number; xMax: number; yMin: number; yMax: number };

type CreateComputeParamsBufferProps = {
  device: GPUDevice;
  params: {
    nx: number;
    ny: number;
    domain: Bounds;
    omega: number;
    t0: number;
  };
};

export const createComputeParamsBuffer = ({
  device,
  params,
}: CreateComputeParamsBufferProps) => {
  const buffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const data = new ArrayBuffer(32);
  const view = new DataView(data);

  const TIME_OFFSET = 28; // байтовое смещение поля t внутри computeParamsBuffer

  view.setUint32(0, params.nx, true);
  view.setUint32(4, params.ny, true);
  view.setFloat32(8, params.domain.xMin, true);
  view.setFloat32(12, params.domain.yMin, true);
  view.setFloat32(16, params.domain.xMax, true);
  view.setFloat32(20, params.domain.yMax, true);
  view.setFloat32(24, params.omega, true);
  view.setFloat32(TIME_OFFSET, params.t0, true);

  device.queue.writeBuffer(buffer, 0, data);

  return { computeParamsBuffer: buffer, TIME_OFFSET };
};
