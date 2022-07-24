#include header.fs;

void main() {
  vec2 uv, cv, dv;
  uv = gl_FragCoord.xy / size;
  cv = (uv * 2. - 1.) * contain;
  dv = (uv * 2. - 1.) * cover;

  vec3 c;
  float a, b;

  vec2 u, v;
  vec3 hex = cart2hex(cv);
  b = 1. - edge(0.75, amax(hex));
  c += b;
  a = b;
  // c *= col_w * 0.5;
  // c.rg = uv;
  fragColor = vec4(c, a);
}
