type CreateMacroBuffersProps = {
  device: GPUDevice;
  nx: number;
  ny: number;
  u0: number;
};

export const createMacroBuffers = ({
  device,
  nx,
  ny,
  u0,
}: CreateMacroBuffersProps) => {
  const cellCount = nx * ny;
  const usage =
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
  // COPY_SRC нужен для периодического readback при проверке сходимости

  const rhoBuffer = device.createBuffer({ size: cellCount * 4, usage });
  const uBuffer = device.createBuffer({ size: cellCount * 4, usage });
  const vBuffer = device.createBuffer({ size: cellCount * 4, usage });

  const rhoInit = new Float32Array(cellCount).fill(1.0); // rho=ones(nx,ny)
  device.queue.writeBuffer(rhoBuffer, 0, rhoInit);

  const uInit = new Float32Array(cellCount); // нули по умолчанию
  for (let i = 0; i < nx; i++) {
    uInit[(ny - 1) * nx + i] = u0; // u(:,ny)=u0 — верхняя строка, крышка
  }
  device.queue.writeBuffer(uBuffer, 0, uInit);

  // vBuffer остаётся нулевым — как и по умолчанию у нового буфера

  return { rhoBuffer, uBuffer, vBuffer };
};
