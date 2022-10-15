#include common.fs

vec3 c2h(vec2 c) {
  vec3 hex;
  hex.y = (c.x - c.y * 1. / sr3);
  hex.z =  c.y * 2. / sr3;
  hex.x = -hex.z - hex.y;
  return hex;
}

vec2 h2c(vec3 c) {
  vec2 cart = vec2(
    c.y + 0.5 * c.z,
    sr3 / 2. * c.z
  );
  return cart;
}

vec3 h2h(vec3 c) {
  vec2 v;
  v = vec2(
    c.y + 0.5 * c.z,
    sr3 / 2. * c.z
  );
  v = vec2(
    v.y - v.x * 1. / sr3,
    v.x * 2. / sr3
  );
  return vec3(-v.x - v.y, v.y, v.x);
}

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;

  cv.y *= size.y / size.x;
  cv.y += parallax.y * 0.25;
  vec3 c;

  vec3 dist, p[3];
  vec3 hex = c2h(cv * 2.0);
  cv = h2c(hex);
  hex = c2h(cv);
  dist = interpolatedCubic(hex, p);

  float a = 100.;
  for (int i = 0; i < 1; i++) {
    vec3 cel = hex - p[i];
    a = min(a, amax(cel));
  }

  c += a;
  // c = fract(hex);

  gl_FragColor = vec4(c, 1);
}
