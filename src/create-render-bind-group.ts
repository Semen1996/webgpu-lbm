type CreateRenderBindGroupsProps = {
  device: GPUDevice;
  pipeline: GPURenderPipeline;
  valueBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createRenderBindGroup = ({
  device,
  pipeline,
  valueBuffer,
  paramsBuffer,
}: CreateRenderBindGroupsProps) => {
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),

    entries: [
      { binding: 0, resource: { buffer: valueBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  return bindGroup;
};
