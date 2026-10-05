struct Params {
  gridSize: vec2<u32>,
  u0: f32,
  _pad: f32,
  viewportMin: vec2<f32>,
  viewportMax: vec2<f32>,
  domainMin: vec2<f32>,
  domainMax: vec2<f32>,
};

@group(0) @binding(0) var<storage, read> uVel: array<f32>;
@group(0) @binding(1) var<storage, read> vVel: array<f32>;
@group(0) @binding(2) var<uniform> params: Params;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var out: VertexOutput;
  out.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
  out.uv = pos[vertexIndex] * 0.5 + vec2<f32>(0.5, 0.5);
  return out;
}

fn colormap(t: f32) -> vec3<f32> {
  let c0 = vec3<f32>(0.0, 0.0, 0.5);
  let c1 = vec3<f32>(0.0, 0.8, 0.8);
  let c2 = vec3<f32>(0.9, 0.9, 0.0);
  let c3 = vec3<f32>(0.8, 0.0, 0.0);

  if (t < 0.33) {
    return mix(c0, c1, t / 0.33);
  } else if (t < 0.66) {
    return mix(c1, c2, (t - 0.33) / 0.33);
  } else {
    return mix(c2, c3, (t - 0.66) / 0.34);
  }
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let uv = clamp(in.uv, vec2<f32>(0.0), vec2<f32>(1.0));

  let worldPos = params.viewportMin + uv * (params.viewportMax - params.viewportMin);

  if (worldPos.x < params.domainMin.x || worldPos.x > params.domainMax.x ||
      worldPos.y < params.domainMin.y || worldPos.y > params.domainMax.y) {
    discard;
  }

  let local = (worldPos - params.domainMin) / (params.domainMax - params.domainMin);

  let ix = min(u32(local.x * f32(params.gridSize.x)), params.gridSize.x - 1u);
  // MATLAB-сетка индексируется снизу вверх (j=1 — низ, j=ny — верх/крышка),
  // а uv.y=0 у нас соответствует НИЗУ экрана — переворот не нужен
  let iy = min(u32(local.y * f32(params.gridSize.y)), params.gridSize.y - 1u);

  let idx = iy * params.gridSize.x + ix;
  let speed = sqrt(uVel[idx] * uVel[idx] + vVel[idx] * vVel[idx]);

  let t = clamp(speed / params.u0, 0.0, 1.0);

  return vec4<f32>(colormap(t), 1.0);
}