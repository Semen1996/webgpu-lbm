import surfacePlotShader from "./shaders/surface-plot.wgsl?raw";

type InitRenderPipelineProps = {
  device: GPUDevice;
};

export const initRenderPipeline = async ({
  device,
}: InitRenderPipelineProps) => {
  const shaderModule = device.createShaderModule({ code: surfacePlotShader });

  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",

    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
    },

    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",

      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },

    primitive: {
      topology: "triangle-list",
    },
  });

  return pipeline;
};
