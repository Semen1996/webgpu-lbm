type InitWebGPUProps = {
  hasComputePipeline?: boolean;
  requiredSize?: number;
};

export const initWebGPU = async ({
  hasComputePipeline,
  requiredSize,
}: InitWebGPUProps = {}) => {
  if (!navigator.gpu)
    throw new Error("WebGPU cannot be initialized - navigator.gpu not found");

  const adapter = await navigator.gpu.requestAdapter(
    hasComputePipeline
      ? {
          powerPreference: "high-performance",
        }
      : undefined,
  );
  if (!adapter)
    throw new Error("WebGPU cannot be initialized - Adapter not found");

  const device = await adapter.requestDevice(
    requiredSize && hasComputePipeline
      ? {
          requiredLimits: {
            maxStorageBufferBindingSize:
              requiredSize <= 100 * 1000000 // меньше 100 мб
                ? requiredSize
                : adapter.limits.maxStorageBufferBindingSize,
          },
        }
      : undefined,
  );

  device.lost.then(() => {
    console.error("WebGPU cannot be initialized - Device has been lost");
    return null;
  });

  return { adapter, device };
};
