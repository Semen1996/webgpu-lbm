struct Params {
  gridSize: vec2<u32>, // nx, ny
  omega: f32,
  u0: f32,
};

// D2Q9: E, N, W, S, NE, NW, SW, SE, C (те же cx/cy/w, что и в MATLAB, k=1..9 → 0..8)
const cx = array<i32, 9>(1, 0, -1, 0, 1, -1, -1, 1, 0);
const cy = array<i32, 9>(0, 1, 0, -1, 1, 1, -1, -1, 0);
const w  = array<f32, 9>(
  1.0 / 9.0, 1.0 / 9.0, 1.0 / 9.0, 1.0 / 9.0,
  1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0, 1.0 / 36.0,
  4.0 / 9.0
);

@group(0) @binding(0) var<storage, read> fOld: array<f32>;
@group(0) @binding(1) var<storage, read_write> fNew: array<f32>;
@group(0) @binding(2) var<storage, read> rho: array<f32>;
@group(0) @binding(3) var<storage, read> uVel: array<f32>;
@group(0) @binding(4) var<storage, read> vVel: array<f32>;
@group(0) @binding(5) var<uniform> params: Params;

fn wrapi(a: i32, n: i32) -> i32 {
  var r = a % n;
  if (r < 0) { r = r + n; }
  return r;
}

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

  let i = i32(gid.x);
  let j = i32(gid.y);

  for (var k = 0u; k < 9u; k = k + 1u) {
    let si = wrapi(i - cx[k], i32(nx));
    let sj = wrapi(j - cy[k], i32(ny));
    let sIdx = u32(sj) * nx + u32(si);

    let rhoSrc = rho[sIdx];
    let uSrc = uVel[sIdx];
    let vSrc = vVel[sIdx];

    let t1 = uSrc * uSrc + vSrc * vSrc;
    let t2 = uSrc * f32(cx[k]) + vSrc * f32(cy[k]);
    let feq = rhoSrc * w[k] * (1.0 + 3.0 * t2 + 4.5 * t2 * t2 - 1.5 * t1);

    let fOldIdx = fIndex(u32(si), u32(sj), k, nx);
    let fCollided = (1.0 - params.omega) * fOld[fOldIdx] + params.omega * feq;

    fNew[fIndex(gid.x, gid.y, k, nx)] = fCollided;
  }
}