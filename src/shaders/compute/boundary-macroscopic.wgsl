// Params, cx, cy, направления E..C, fIndex — из common.wgsl
//
// Объединённый проход: граничные условия (in-place по f) + пересчёт rho/u/v.
// Оба шага локальны по ячейке, поэтому делаются за одно чтение f.

@group(0) @binding(0) var<storage, read_write> f: array<f32>;
@group(0) @binding(1) var<storage, read_write> rho: array<f32>;
@group(0) @binding(2) var<storage, read_write> uVel: array<f32>;
@group(0) @binding(3) var<storage, read_write> vVel: array<f32>;
@group(0) @binding(4) var<uniform> params: Params;

// плотность на крышке (как в ruv() для i,ny в MATLAB)
fn lidDensity(local: array<f32, 9>) -> f32 {
  return local[C] + local[E] + local[W] + 2.0 * (local[N] + local[NW] + local[NE]);
}

@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let nx = params.gridSize.x;
  let ny = params.gridSize.y;
  if (gid.x >= nx || gid.y >= ny) {
    return;
  }

  let i = gid.x;
  let j = gid.y;

  // локальная копия всех 9 значений этой ячейки — работаем с ней,
  // чтобы точно повторить порядок перезаписи из MATLAB
  var local: array<f32, 9>;
  for (var k = 0u; k < 9u; k = k + 1u) {
    local[k] = f[fIndex(i, j, k, nx)];
  }

  // --- граничные условия ---

  // левая граница, bounce-back
  if (i == 0u) {
    local[E] = local[W];
    local[NE] = local[SW];
    local[SE] = local[NW];
  }

  // правая граница
  if (i == nx - 1u) {
    local[W] = local[E];
    local[SW] = local[NE];
    local[NW] = local[SE];
  }

  // нижняя граница
  if (j == 0u) {
    local[N] = local[S];
    local[NE] = local[SW];
    local[NW] = local[SE];
  }

  // верхняя граница — движущаяся крышка, только внутренние узлы (i=2:nx-1 в MATLAB)
  if (j == ny - 1u && i >= 1u && i <= nx - 2u) {
    let rhon = lidDensity(local);
    local[S] = local[N];
    local[SE] = local[NW] + rhon * params.u0 / 6.0;
    local[SW] = local[NE] - rhon * params.u0 / 6.0;
  }

  // f переписываем только на границе — внутренние ячейки не менялись
  let isBoundary = i == 0u || i == nx - 1u || j == 0u || j == ny - 1u;
  if (isBoundary) {
    for (var k = 0u; k < 9u; k = k + 1u) {
      f[fIndex(i, j, k, nx)] = local[k];
    }
  }

  // --- макроскопические величины ---

  var rhoValue: f32;
  if (j == ny - 1u) {
    // особая формула плотности для верхней строки
    rhoValue = lidDensity(local);
  } else {
    rhoValue = 0.0;
    for (var k = 0u; k < 9u; k = k + 1u) {
      rhoValue = rhoValue + local[k];
    }
  }

  var uSum: f32 = 0.0;
  var vSum: f32 = 0.0;
  for (var k = 0u; k < 9u; k = k + 1u) {
    uSum = uSum + local[k] * f32(cx[k]);
    vSum = vSum + local[k] * f32(cy[k]);
  }

  let idx = j * nx + i;
  rho[idx] = rhoValue;
  uVel[idx] = uSum / rhoValue;
  vVel[idx] = vSum / rhoValue;
}
