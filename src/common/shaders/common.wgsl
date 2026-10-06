// Общий код для всех LBM compute-шейдеров — подставляется в начало каждого
// модуля в init-lbm-pipelines.ts

// сторона квадратной workgroup; значение передаётся из TS (WORKGROUP_SIZE
// в init-lbm-pipelines.ts) через constants при создании pipeline
override WORKGROUP_SIZE: u32 = 8;

struct Params {
  gridSize: vec2<u32>, // nx, ny
  omega: f32,
  u0: f32,
};

// D2Q9: E, N, W, S, NE, NW, SW, SE, C (те же cx/cy/w, что и в MATLAB, k=1..9 → 0..8)
const E = 0u;
const N = 1u;
const W = 2u;
const S = 3u;
const NE = 4u;
const NW = 5u;
const SW = 6u;
const SE = 7u;
const C = 8u;

const cx = array<i32, 9>(1, 0, -1, 0, 1, -1, -1, 1, 0);
const cy = array<i32, 9>(0, 1, 0, -1, 1, 1, -1, -1, 0);
const w  = array<f32, 9>(
  1.0 / 9.0, 1.0 / 9.0, 1.0 / 9.0, 1.0 / 9.0,
  1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0,
  4.0 / 9.0
);

fn fIndex(i: u32, j: u32, k: u32, nx: u32) -> u32 {
  return (j * nx + i) * 9u + k;
}
