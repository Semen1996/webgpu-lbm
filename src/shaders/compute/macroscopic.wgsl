struct Params {
  gridSize: vec2<u32>,
  omega: f32,
  u0: f32,
};

const cx = array<i32, 9>(1, 0, -1, 0, 1, -1, -1, 1, 0);
const cy = array<i32, 9>(0, 1, 0, -1, 1, 1, -1, -1, 0);

@group(0) @binding(0) var<storage, read> f: array<f32>;
@group(0) @binding(1) var<storage, read_write> rho: array<f32>;
@group(0) @binding(2) var<storage, read_write> uVel: array<f32>;
@group(0) @binding(3) var<storage, read_write> vVel: array<f32>;
@group(0) @binding(4) var<uniform> params: Params;

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

  var local: array<f32, 9>;
  for (var k = 0u; k < 9u; k = k + 1u) {
    local[k] = f[fIndex(i, j, k, nx)];
  }

  var rhoValue: f32;
  if (j == ny - 1u) {
    // особая формула плотности для верхней строки (как в ruv() для i,ny)
    rhoValue = local[8] + local[0] + local[2] + 2.0 * (local[1] + local[5] + local[4]);
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