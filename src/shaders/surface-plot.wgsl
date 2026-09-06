struct Params {
  nx: u32,
  ny: u32,
  minValue: f32,
  maxValue: f32,
};

@group(0) @binding(0) var<storage, read> values: array<f32>;
@group(0) @binding(1) var<uniform> params: Params;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  // full-screen triangle трюк: 3 вершины, покрывающие весь экран
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

  let ix = min(u32(uv.x * f32(params.nx)), params.nx - 1u);
  let iy = min(u32(uv.y * f32(params.ny)), params.ny - 1u);

  let value = values[iy * params.nx + ix];
  let t = clamp((value - params.minValue) / (params.maxValue - params.minValue), 0.0, 1.0);

  return vec4<f32>(colormap(t), 1.0);
}