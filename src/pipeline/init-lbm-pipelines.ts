import commonShader from "@/shaders/compute/common.wgsl?raw";
import collideStreamShader from "@/shaders/compute/collide-stream.wgsl?raw";
import boundaryMacroscopicShader from "@/shaders/compute/boundary-macroscopic.wgsl?raw";

const createLbmComputePipeline = (device: GPUDevice, shader: string) =>
  device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: `${commonShader}\n${shader}` }),
      entryPoint: "main",
    },
  });

export const initLbmPipelines = async ({ device }: { device: GPUDevice }) => {
  const [collideStreamPipeline, boundaryMacroscopicPipeline] =
    await Promise.all([
      createLbmComputePipeline(device, collideStreamShader),
      createLbmComputePipeline(device, boundaryMacroscopicShader),
    ]);

  return { collideStreamPipeline, boundaryMacroscopicPipeline };
};
