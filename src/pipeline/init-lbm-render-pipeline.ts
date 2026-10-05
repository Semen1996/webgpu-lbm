import lbmRenderShader from "@/shaders/lbm-render.wgsl?raw";

type InitLbmRenderPipelineProps = {
  device: GPUDevice;
};

export const initLbmRenderPipeline = async ({
  device,
}: InitLbmRenderPipelineProps) => {
  const shaderModule = device.createShaderModule({ code: lbmRenderShader });

  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex: { module: shaderModule, entryPoint: "vs_main" },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
    },
    primitive: { topology: "triangle-list" },
  });

  return pipeline;
};
