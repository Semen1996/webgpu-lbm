import computeShader from "./shaders/wave.comp.wgsl?raw";

type InitComputePipelineProps = {
  device: GPUDevice;
};

export const initComputePipeline = async ({
  device,
}: InitComputePipelineProps) => {
  const shaderModule = device.createShaderModule({ code: computeShader });

  const pipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "main" },
  });

  return pipeline;
};
