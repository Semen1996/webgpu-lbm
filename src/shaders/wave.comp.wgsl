struct ComputeParams {
  gridSize: vec2<u32>,
  domainMin: vec2<f32>,
  domainMax: vec2<f32>,
  omega: f32,
  t: f32,
};

@group(0) @binding(0) var<storage, read_write> values: array<f32>;
@group(0) @binding(1) var<uniform> params: ComputeParams;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= params.gridSize.x || gid.y >= params.gridSize.y) {
    return;
  }

  let x = params.domainMin.x +
    (params.domainMax.x - params.domainMin.x) * f32(gid.x) / f32(params.gridSize.x - 1u);
  let y = params.domainMin.y +
    (params.domainMax.y - params.domainMin.y) * f32(gid.y) / f32(params.gridSize.y - 1u);

  let value = sin(x + params.omega) * cos(y + params.omega)*sin(params.t);

  values[gid.y * params.gridSize.x + gid.x] = value;
}