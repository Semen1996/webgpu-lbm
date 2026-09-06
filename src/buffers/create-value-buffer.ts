type CreateValueBufferProps = {
  device: GPUDevice;
  initialValue: Float32Array;
};

export const createValueBuffer = ({
  device,
  initialValue,
}: CreateValueBufferProps) => {
  const valueBuffer = device.createBuffer({
    size: initialValue.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(valueBuffer, 0, initialValue);

  return valueBuffer;
};
