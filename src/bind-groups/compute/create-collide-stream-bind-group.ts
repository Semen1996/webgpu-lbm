type CreateCollideStreamBindGroupProps = {
  device: GPUDevice;
  collideStreamPipeline: GPUComputePipeline;
  fSrcBuffer: GPUBuffer;
  fDstBuffer: GPUBuffer;
  rhoBuffer: GPUBuffer;
  uBuffer: GPUBuffer;
  vBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createCollideStreamBindGroup = ({
  device,
  collideStreamPipeline,
  fSrcBuffer,
  fDstBuffer,
  rhoBuffer,
  uBuffer,
  vBuffer,
  paramsBuffer,
}: CreateCollideStreamBindGroupProps) => {
  const collideStreamLayout = collideStreamPipeline.getBindGroupLayout(0);

  const collideStream = device.createBindGroup({
    layout: collideStreamLayout,
    entries: [
      { binding: 0, resource: { buffer: fSrcBuffer } },
      { binding: 1, resource: { buffer: fDstBuffer } },
      { binding: 2, resource: { buffer: rhoBuffer } },
      { binding: 3, resource: { buffer: uBuffer } },
      { binding: 4, resource: { buffer: vBuffer } },
      { binding: 5, resource: { buffer: paramsBuffer } },
    ],
  });

  return collideStream;
};
