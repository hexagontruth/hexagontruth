#include common.fs

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  cv.y *= size.y / size.x;
  cv.y += parallax.y * 0.25;

  cv -= dir / 10.;
  vec3 c;
  c = vec3(1, 0, 1);
  c.rg = uv;
  //c.b = fract(time - step(0.5, uv.y)/2.);
  vec2 u, v;
  u = vec2(0.5, 0);
  v = vec2(-0.5, 0);
  u = trot(u, time);
  v = trot(v, time);
  float b = slength(u, v, cv);
  b = qw(b, 1./amin(size), 1./60.);
  c = c + b;
  vec3 hex = cart2hex(cv);
  c = mix(c, texture(inputTexture, uv).rgb, 0.75);
  c = xsum(c, unit.xxx * step(0.5, amax(hex)));
  c = 1. - c;
  fragColor = vec4(c, 1);
}
