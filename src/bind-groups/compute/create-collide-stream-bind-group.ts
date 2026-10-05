type CreateLbmBindGroupsProps = {
  device: GPUDevice;
  collideStreamPipeline: GPUComputePipeline;
  fABuffer: GPUBuffer;
  fBBuffer: GPUBuffer;
  rhoBuffer: GPUBuffer;
  uBuffer: GPUBuffer;
  vBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createCollideStreamBindGroup = ({
  device,
  collideStreamPipeline,
  fABuffer,
  fBBuffer,
  rhoBuffer,
  uBuffer,
  vBuffer,
  paramsBuffer,
}: CreateLbmBindGroupsProps) => {
  const collideStreamLayout = collideStreamPipeline.getBindGroupLayout(0);

  const collideStream = device.createBindGroup({
    layout: collideStreamLayout,
    entries: [
      { binding: 0, resource: { buffer: fABuffer } },
      { binding: 1, resource: { buffer: fBBuffer } },
      { binding: 2, resource: { buffer: rhoBuffer } },
      { binding: 3, resource: { buffer: uBuffer } },
      { binding: 4, resource: { buffer: vBuffer } },
      { binding: 5, resource: { buffer: paramsBuffer } },
    ],
  });

  return collideStream;
};
