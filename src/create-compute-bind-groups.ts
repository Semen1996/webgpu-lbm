type CreateComputeBindGroupsProps = {
  device: GPUDevice;
  pipeline: GPUComputePipeline;
  valueBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createComputeBindGroups = ({
  device,
  pipeline,
  valueBuffer,
  paramsBuffer,
}: CreateComputeBindGroupsProps) => {
  const layout = pipeline.getBindGroupLayout(0);

  const computeBindGroup = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: valueBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  return computeBindGroup;
};
