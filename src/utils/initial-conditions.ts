export const VIEWPORT = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
export const DOMAIN = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

export const NX = 301;
export const NY = 301;
export const U0 = 0.1;
export const RE = 1000; // Число Рейнольдса
export const ALPHA = (U0 * (NY - 1)) / RE;
export const OMEGA = 1.0 / (3.0 * ALPHA + 0.5);
