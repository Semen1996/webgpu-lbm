type CreateBoundaryMacroscopicBindGroupProps = {
  device: GPUDevice;
  boundaryMacroscopicPipeline: GPUComputePipeline;
  fBuffer: GPUBuffer;
  macroBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createBoundaryMacroscopicBindGroup = ({
  device,
  boundaryMacroscopicPipeline,
  fBuffer,
  macroBuffer,
  paramsBuffer,
}: CreateBoundaryMacroscopicBindGroupProps) => {
  const layout = boundaryMacroscopicPipeline.getBindGroupLayout(0);

  const bindGroup = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: fBuffer } },
      { binding: 1, resource: { buffer: macroBuffer } },
      { binding: 2, resource: { buffer: paramsBuffer } },
    ],
  });

  return bindGroup;
};
