type CreateFBufferProps = { device: GPUDevice; nx: number; ny: number };

export const createFBuffer = ({ device, nx, ny }: CreateFBufferProps) => {
  const size = nx * ny * 9 * 4; // 9 направлений на ячейку, float32

  const fBuffer = device.createBuffer({
    size,
    usage: GPUBufferUsage.STORAGE, // пишут только шейдеры, с CPU не заполняется
  });
  return fBuffer;
};
