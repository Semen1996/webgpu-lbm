type CreateLbmRenderBindGroupProps = {
  device: GPUDevice;
  pipeline: GPURenderPipeline;
  uBuffer: GPUBuffer;
  vBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createLbmRenderBindGroup = ({
  device,
  pipeline,
  uBuffer,
  vBuffer,
  paramsBuffer,
}: CreateLbmRenderBindGroupProps) => {
  const layout = pipeline.getBindGroupLayout(0);

  const renderBindGroup = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: uBuffer } },
      { binding: 1, resource: { buffer: vBuffer } },
      { binding: 2, resource: { buffer: paramsBuffer } },
    ],
  });

  return renderBindGroup;
};
