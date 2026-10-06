type CreateMacroBufferProps = {
  device: GPUDevice;
  nx: number;
  ny: number;
  u0: number;
};

// rho, u, v в одном буфере: vec4<f32> на ячейку (x = rho, y = u, z = v, w не используется)
export const createMacroBuffer = ({
  device,
  nx,
  ny,
  u0,
}: CreateMacroBufferProps) => {
  const cellCount = nx * ny;

  const macroBuffer = device.createBuffer({
    size: cellCount * 4 * 4, // vec4<f32>
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const init = new Float32Array(cellCount * 4); // u = v = 0 по умолчанию
  for (let idx = 0; idx < cellCount; idx++) {
    init[idx * 4] = 1.0; // rho=ones(nx,ny)
  }
  for (let i = 0; i < nx; i++) {
    init[((ny - 1) * nx + i) * 4 + 1] = u0; // u(:,ny)=u0 — верхняя строка, крышка
  }
  device.queue.writeBuffer(macroBuffer, 0, init);

  return macroBuffer;
};
