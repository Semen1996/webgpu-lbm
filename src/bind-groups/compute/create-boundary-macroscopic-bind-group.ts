type CreateBoundaryMacroscopicBindGroupProps = {
  device: GPUDevice;
  boundaryMacroscopicPipeline: GPUComputePipeline;
  fBuffer: GPUBuffer;
  rhoBuffer: GPUBuffer;
  uBuffer: GPUBuffer;
  vBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createBoundaryMacroscopicBindGroup = ({
  device,
  boundaryMacroscopicPipeline,
  fBuffer,
  rhoBuffer,
  uBuffer,
  vBuffer,
  paramsBuffer,
}: CreateBoundaryMacroscopicBindGroupProps) => {
  const layout = boundaryMacroscopicPipeline.getBindGroupLayout(0);

  const bindGroup = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: fBuffer } },
      { binding: 1, resource: { buffer: rhoBuffer } },
      { binding: 2, resource: { buffer: uBuffer } },
      { binding: 3, resource: { buffer: vBuffer } },
      { binding: 4, resource: { buffer: paramsBuffer } },
    ],
  });

  return bindGroup;
};
