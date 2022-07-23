#include header.fs;

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  cv.y *= size.y / size.x;
  vec3 c;
  float a, b;

  vec2 u, v;
  vec3 hex = cart2hex(cv);
  b = 1. - smoothsym(0.75, 2./size.x, amax(hex));
  c += b;
  a = b;
  c *= col_w * 0.5;
  fragColor = vec4(c, a);
}
