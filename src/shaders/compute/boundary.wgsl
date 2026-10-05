struct Params {
  gridSize: vec2<u32>,
  omega: f32,
  u0: f32,
};

@group(0) @binding(0) var<storage, read_write> f: array<f32>;
@group(0) @binding(1) var<uniform> params: Params;

fn fIndex(i: u32, j: u32, k: u32, nx: u32) -> u32 {
  return (j * nx + i) * 9u + k;
}

@compute @workgroup_size(8, 8)
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

  // левая граница, bounce-back
  if (i == 0u) {
    local[0] = local[2]; // E = W
    local[4] = local[6]; // NE = SW
    local[7] = local[5]; // SE = NW
  }

  // правая граница
  if (i == nx - 1u) {
    local[2] = local[0]; // W = E
    local[6] = local[4]; // SW = NE
    local[5] = local[7]; // NW = SE
  }

  // нижняя граница
  if (j == 0u) {
    local[1] = local[3]; // N = S
    local[4] = local[6]; // NE = SW
    local[5] = local[7]; // NW = SE
  }

  // верхняя граница — движущаяся крышка, только внутренние узлы (i=2:nx-1 в MATLAB)
  if (j == ny - 1u && i >= 1u && i <= nx - 2u) {
    let rhon = local[8] + local[0] + local[2] + 2.0 * (local[1] + local[5] + local[4]);
    local[3] = local[1];                          // S = N
    local[7] = local[5] + rhon * params.u0 / 6.0;  // SE = NW + поправка
    local[6] = local[4] - rhon * params.u0 / 6.0;  // SW = NE - поправка
  }

  for (var k = 0u; k < 9u; k = k + 1u) {
    f[fIndex(i, j, k, nx)] = local[k];
  }
}