export const initWebGPU = async () => {
  if (!navigator.gpu)
    throw new Error("WebGPU cannot be initialized - navigator.gpu not found");

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter)
    throw new Error("WebGPU cannot be initialized - Adapter not found");

  const device = await adapter.requestDevice();
  device.lost.then(() => {
    console.error("WebGPU cannot be initialized - Device has been lost");
    return null;
  });

  return { adapter, device };
};
