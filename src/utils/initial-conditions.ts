export const VIEWPORT = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
export const DOMAIN = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

export const NX = 301;
export const NY = 301;
export const U0 = 0.1;
export const RE_TARGET = 1000; // Число Рейнольдса
export const ALPHA = (U0 * (NY - 1)) / RE_TARGET;
export const OMEGA = 1.0 / (3.0 * ALPHA + 0.5);
export const RE = (U0 * (NY - 1)) / ALPHA; // Число Рейнольдса
