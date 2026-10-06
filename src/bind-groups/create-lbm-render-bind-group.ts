type CreateLbmRenderBindGroupProps = {
  device: GPUDevice;
  pipeline: GPURenderPipeline;
  macroBuffer: GPUBuffer;
  paramsBuffer: GPUBuffer;
};

export const createLbmRenderBindGroup = ({
  device,
  pipeline,
  macroBuffer,
  paramsBuffer,
}: CreateLbmRenderBindGroupProps) => {
  const layout = pipeline.getBindGroupLayout(0);

  const renderBindGroup = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: macroBuffer } },
      { binding: 1, resource: { buffer: paramsBuffer } },
    ],
  });

  return renderBindGroup;
};
