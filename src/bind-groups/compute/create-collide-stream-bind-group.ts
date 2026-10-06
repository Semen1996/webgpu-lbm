type CreateCollideStreamBindGroupProps = {
  device: GPUDevice;
  collideStreamPipeline: GPUComputePipeline;
  fSrcBuffer: GPUBuffer;
  fDstBuffer: GPUBuffer;
  macroBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createCollideStreamBindGroup = ({
  device,
  collideStreamPipeline,
  fSrcBuffer,
  fDstBuffer,
  macroBuffer,
  paramsBuffer,
}: CreateCollideStreamBindGroupProps) => {
  const collideStreamLayout = collideStreamPipeline.getBindGroupLayout(0);

  const collideStream = device.createBindGroup({
    layout: collideStreamLayout,
    entries: [
      { binding: 0, resource: { buffer: fSrcBuffer } },
      { binding: 1, resource: { buffer: fDstBuffer } },
      { binding: 2, resource: { buffer: macroBuffer } },
      { binding: 3, resource: { buffer: paramsBuffer } },
    ],
  });

  return collideStream;
};
