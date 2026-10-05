type RenderFrameProps = {
  device: GPUDevice;
  context: GPUCanvasContext;
  renderPipeline: GPURenderPipeline;
  renderBindGroup: GPUBindGroup;
};

export function renderFrame({
  device,
  context,
  renderPipeline,
  renderBindGroup,
}: RenderFrameProps) {
  const encoder = device.createCommandEncoder();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(renderPipeline);
  renderPass.setBindGroup(0, renderBindGroup);
  renderPass.draw(3);
  renderPass.end();
  device.queue.submit([encoder.finish()]);
}
