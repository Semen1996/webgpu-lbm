struct Params {
  gridSize: vec2<u32>,     // nx, ny
  valueRange: vec2<f32>,   // minValue, maxValue
  viewportMin: vec2<f32>,  // xMin, yMin
  viewportMax: vec2<f32>,  // xMax, yMax
  domainMin: vec2<f32>,    // xMin, yMin
  domainMax: vec2<f32>,    // xMax, yMax
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

  // uv -> физическая координата в системе VIEWPORT
  let worldPos = params.viewportMin + uv * (params.viewportMax - params.viewportMin);

  // если точка вне расчётной области — просто фон, данных там нет
  if (worldPos.x < params.domainMin.x || worldPos.x > params.domainMax.x ||
      worldPos.y < params.domainMin.y || worldPos.y > params.domainMax.y) {
    discard;
  }

  // локальная координата внутри DOMAIN, нормализованная в [0,1]
  let local = (worldPos - params.domainMin) / (params.domainMax - params.domainMin);

  let ix = min(u32(local.x * f32(params.gridSize.x)), params.gridSize.x - 1u);
  let iy = min(u32(local.y * f32(params.gridSize.y)), params.gridSize.y - 1u);

  let value = values[iy * params.gridSize.x + ix];
  let t = clamp((value - params.valueRange.x) / (params.valueRange.y - params.valueRange.x), 0.0, 1.0);

  return vec4<f32>(colormap(t), 1.0);
}