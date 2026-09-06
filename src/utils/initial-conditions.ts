// Реальные размеры графика
export const VIEWPORT = {
  xMin: 0,
  xMax: 50,
  yMin: 0,
  yMax: 50,
};

// Расчётная область — физический размер и положение данных,
export const DOMAIN = {
  xMin: 0,
  xMax: 40,
  yMin: 0,
  yMax: 40,
};

export const t0 = 0; // начальное время, [c]
export const t = t0; // текущее время, [c]
export const dt = 0.001; // шаг по времени, [c]

export const OMEGA = -1; // скорость изменения вращения, [м/с]

export const NX = 1000; // количество узлов по x-координате
export const NY = 1000; // количество узлов по Y-координате

export const initialValue = new Float32Array(NX * NY); // массив значений

// запись данных в массив значений
for (let iy = 0; iy < NY; iy++) {
  for (let ix = 0; ix < NX; ix++) {
    const x = DOMAIN.xMin + ((DOMAIN.xMax - DOMAIN.xMin) * ix) / (NX - 1);
    const y = DOMAIN.yMin + ((DOMAIN.yMax - DOMAIN.yMin) * iy) / (NY - 1);

    initialValue[iy * NX + ix] =
      Math.sin(x + OMEGA * t0) * Math.cos(y + OMEGA * t0);
  }
}
