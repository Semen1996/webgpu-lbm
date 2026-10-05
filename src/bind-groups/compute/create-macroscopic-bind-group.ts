type CreateMacroscopicBindGroupsProp = {
  device: GPUDevice;
  macroscopicPipeline: GPUComputePipeline;
  fBuffer: GPUBuffer;
  rhoBuffer: GPUBuffer;
  uBuffer: GPUBuffer;
  vBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createMacroscopicBindGroup = ({
  device,
  macroscopicPipeline,
  fBuffer,
  rhoBuffer,
  uBuffer,
  vBuffer,
  paramsBuffer,
}: CreateMacroscopicBindGroupsProp) => {
  const macroscopicLayout = macroscopicPipeline.getBindGroupLayout(0);

  const macroscopicBindGroup = device.createBindGroup({
    layout: macroscopicLayout,
    entries: [
      { binding: 0, resource: { buffer: fBuffer } },
      { binding: 1, resource: { buffer: rhoBuffer } },
      { binding: 2, resource: { buffer: uBuffer } },
      { binding: 3, resource: { buffer: vBuffer } },
      { binding: 4, resource: { buffer: paramsBuffer } },
    ],
  });

  return macroscopicBindGroup;
};
