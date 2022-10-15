#include common.fs

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  vec3 c;

  vec3 dist, p[3];
  vec3 hex = cart2hex * vec3(cv * 2., 0);
  cv = (hex2cart * hex).xy;
  hex = cart2hex * vec3(cv, 1);
  dist = interpolatedCubic(hex, p);

  float a = 100.;
  for (int i = 0; i < 3; i++) {
    vec3 cel = hex - p[i];
    a = min(a, amax(cel));
  }

  c += a;

  c = fract(hex);
  gl_FragColor = vec4(c, 1);
}
