import collideStreamShader from "@/shaders/compute/collide-stream.wgsl?raw";
import boundaryShader from "@/shaders/compute/boundary.wgsl?raw";
import macroscopicShader from "@/shaders/compute/macroscopic.wgsl?raw";

export const initLbmPipelines = async ({ device }: { device: GPUDevice }) => {
  const collideStreamPipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: collideStreamShader }),
      entryPoint: "main",
    },
  });

  const boundaryPipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: boundaryShader }),
      entryPoint: "main",
    },
  });

  const macroscopicPipeline = await device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: macroscopicShader }),
      entryPoint: "main",
    },
  });

  return { collideStreamPipeline, boundaryPipeline, macroscopicPipeline };
};
