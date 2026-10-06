export type Bounds = { xMin: number; xMax: number; yMin: number; yMax: number };

// физика и сетка
export type SimulationConfig = {
  nx: number;
  ny: number;
  u0: number; // скорость крышки
  Re: number; // число Рейнольдса
};

// отображение сетки на область графика
export type ViewConfig = {
  viewport: Bounds;
  domain: Bounds;
};

export const SIM: SimulationConfig = {
  nx: 301,
  ny: 301,
  u0: 0.1,
  Re: 1000,
};

export const VIEW: ViewConfig = {
  viewport: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
  domain: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
};

// параметр релаксации BGK из Re: nu = u0 * (ny - 1) / Re, omega = 1 / (3 * nu + 0.5)
export const computeOmega = ({ ny, u0, Re }: SimulationConfig) => {
  const nu = (u0 * (ny - 1)) / Re;
  return 1.0 / (3.0 * nu + 0.5);
};
