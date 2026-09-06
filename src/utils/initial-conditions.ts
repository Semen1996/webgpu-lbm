// Реальные размеры графика
export const VIEWPORT = {
  xMin: 0,
  xMax: 50,
  yMin: 0,
  yMax: 50,
};

export const NX = 1000; // количество узлов по x-координате
export const NY = 1000; // количество узлов по Y-координате

export const initialValue = new Float32Array(NX * NY); // массив значений

// запись данных в массив значений
for (let iy = 0; iy < NY; iy++) {
  for (let ix = 0; ix < NX; ix++) {
    const x = VIEWPORT.xMin + ((VIEWPORT.xMax - VIEWPORT.xMin) * ix) / (NX - 1);
    const y = VIEWPORT.yMin + ((VIEWPORT.yMax - VIEWPORT.yMin) * iy) / (NY - 1);

    initialValue[iy * NX + ix] = Math.sin(x) * Math.cos(y);
  }
}
