uniform float gridSize;
uniform vec2 pan;

vec3 uv2cell(vec2 uv, vec2 txSize) {
  uv = uv * 2. - 1.;
  uv += 0.5/txSize;

  float s = txSize.x / 2.;
  float g = gridSize;

  vec3 hex, pix, cel;
  hex = vec3(uv, -uv.x -uv.y);
  hex = hex * s / g;

  cel = roundGrid(hex, g);
  return cel;
}

vec3 uv2cell(vec2 uv) {
  return uv2cell(uv, size);
}

vec2 cell2uv(vec3 hex, vec2 txSize) {
  vec2 uv = hex.xy; // This should be -yz? I think?
  uv = uv / txSize + 0.5;
  uv -= 0.5 / txSize;
  return uv;
}

vec2 cell2uv(vec3 hex) {
  return cell2uv(hex, size);
}
