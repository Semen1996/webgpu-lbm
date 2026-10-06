// Params, cx, cy, w, fIndex — из common.wgsl

@group(0) @binding(0) var<storage, read> fOld: array<f32>;
@group(0) @binding(1) var<storage, read_write> fNew: array<f32>;
// x = rho, y = u, z = v, w не используется
@group(0) @binding(2) var<storage, read> macroFields: array<vec4<f32>>;
@group(0) @binding(3) var<uniform> params: Params;

fn wrapi(a: i32, n: i32) -> i32 {
  var r = a % n;
  if (r < 0) { r = r + n; }
  return r;
}

@compute @workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE)
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

    let m = macroFields[sIdx];
    let rhoSrc = m.x;
    let uSrc = m.y;
    let vSrc = m.z;

    let t1 = uSrc * uSrc + vSrc * vSrc;
    let t2 = uSrc * f32(cx[k]) + vSrc * f32(cy[k]);
    let feq = rhoSrc * w[k] * (1.0 + 3.0 * t2 + 4.5 * t2 * t2 - 1.5 * t1);

    let fOldIdx = fIndex(u32(si), u32(sj), k, nx);
    let fCollided = (1.0 - params.omega) * fOld[fOldIdx] + params.omega * feq;

    fNew[fIndex(gid.x, gid.y, k, nx)] = fCollided;
  }
}
