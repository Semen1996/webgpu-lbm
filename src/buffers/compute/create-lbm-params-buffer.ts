type CreateLbmParamsBufferProps = {
  device: GPUDevice;
  params: { nx: number; ny: number; omega: number; u0: number };
};

export const createLbmParamsBuffer = ({
  device,
  params,
}: CreateLbmParamsBufferProps) => {
  const buffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const data = new ArrayBuffer(16);
  const view = new DataView(data);
  view.setUint32(0, params.nx, true);
  view.setUint32(4, params.ny, true);
  view.setFloat32(8, params.omega, true);
  view.setFloat32(12, params.u0, true);

  device.queue.writeBuffer(buffer, 0, data);

  return buffer;
};
