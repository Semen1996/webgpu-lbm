type InitCanvasProps = {
  canvasSelector: string;
  device: GPUDevice;
};

export function initCanvas({ canvasSelector, device }: InitCanvasProps) {
  // Создание контекста канваса
  const canvas: HTMLCanvasElement | null =
    document.querySelector(canvasSelector);
  if (!canvas)
    throw new Error("WebGPU cannot be initialized - Canvas isn't found");

  const context = canvas.getContext("webgpu") as GPUCanvasContext | null;
  if (!context) {
    throw new Error(
      "WebGPU cannot be initialized - Canvas does not support WebGPU",
    );
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  return { canvas, context };
}
