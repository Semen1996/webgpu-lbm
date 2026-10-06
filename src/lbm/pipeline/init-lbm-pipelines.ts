import commonShader from "@/common/shaders/common.wgsl?raw";
import collideStreamShader from "../shaders/collide-stream.wgsl?raw";
import boundaryMacroscopicShader from "../shaders/boundary-macroscopic.wgsl?raw";

// сторона workgroup для compute-шейдеров (override WORKGROUP_SIZE в common.wgsl)
export const WORKGROUP_SIZE = 8;

const createLbmComputePipeline = (device: GPUDevice, shader: string) =>
  device.createComputePipelineAsync({
    layout: "auto",
    compute: {
      module: device.createShaderModule({ code: `${commonShader}\n${shader}` }),
      entryPoint: "main",
      constants: { WORKGROUP_SIZE },
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
