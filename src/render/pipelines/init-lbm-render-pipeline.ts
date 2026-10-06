import lbmRenderShader from "../shaders/lbm-render.wgsl?raw";

type InitLbmRenderPipelineProps = {
  device: GPUDevice;
  format: GPUTextureFormat;
};

export const initLbmRenderPipeline = async ({
  device,
  format,
}: InitLbmRenderPipelineProps) => {
  const shaderModule = device.createShaderModule({ code: lbmRenderShader });

  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",
    vertex: { module: shaderModule, entryPoint: "vs_main" },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  return pipeline;
};
