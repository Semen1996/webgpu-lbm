type CreateRenderParamsBufferProps = {
  device: GPUDevice;
  params: {
    nx: number;
    ny: number;
    minValue: number;
    maxValue: number;
  };
};

export const createRenderParamsBuffer = ({
  device,
  params,
}: CreateRenderParamsBufferProps) => {
  const buffer = device.createBuffer({
    size: 16, // 2x u32 + 2x f32
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const data = new ArrayBuffer(16);
  const view = new DataView(data);
  view.setUint32(0, params.nx, true);
  view.setUint32(4, params.ny, true);
  view.setFloat32(8, params.minValue, true);
  view.setFloat32(12, params.maxValue, true);

  device.queue.writeBuffer(buffer, 0, data);

  return buffer;
};
