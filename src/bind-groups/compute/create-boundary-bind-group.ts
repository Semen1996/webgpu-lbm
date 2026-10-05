type CreateBoundaryBindGroupProps = {
  device: GPUDevice;
  boundaryPipeline: GPUComputePipeline;
  fBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createBoundaryBindGroup = ({
  device,
  boundaryPipeline,
  fBuffer,
  paramsBuffer,
}: CreateBoundaryBindGroupProps) => {
  const boundaryLayout = boundaryPipeline.getBindGroupLayout(0);

  const boundaryBindGroup = device.createBindGroup({
    layout: boundaryLayout,
    entries: [
      { binding: 0, resource: { buffer: fBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  return boundaryBindGroup;
};
