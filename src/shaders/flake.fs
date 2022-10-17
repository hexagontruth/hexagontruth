#include common.fs

float istep(float n, float v) {
  return 1. - step(n, v);
}

float idist(float n, float v) {
  return clamp(smoothstep(-0.05, 0., v - n), 0., 1.) * istep(n, v);
}

vec3 angle(vec2 cv, float i, float d) {
  return cart2hex * (cv + rot(unit.xy, i/6. * tau) * d);
}

float rad(vec3 hex, float r) {
  return amax(hex) - r;
}

void main() {
  vec3 c;
  c = unit.yyy;
  vec2 uv, cv, ov;
  uv = gl_FragCoord.xy / size;
  ov = uv * 2. - 1.;
  vec3 hex, sex;
  float a, b, e, r, x, y, z, q, s, w, t, scale;

  ov *= cover;
  ov.y += parallax.y * 0.5;
  ov += dir / 10.;

  scale = 6.;
  ov *= scale;
  cv = ov;

  q = 2./ amax(size) * scale * sr3 ;
  w = 1./960. * scale * sr3;

  hex = cart2hex * cv;

  a = 0.;

  b = xsum(b, a);
  for (int j = 0; j <6; j++) {
    float jj = float(j);
    t = fract(time + jj/6.);
    s = 1. / (1. + jj);
    cv = ov * s;
    // TODO: Reflections instead of this
    for (int i = 0; i < 6; i++) {
      float ii = float(i);
      sex = angle(cv, ii, 0.);
      e = rad(sex, 2. * max(0., t - 0.5));
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a;
      b = xsum(b, a);

      sex = angle(cv, ii, 2. * t);
      e = rad(sex, 1.);
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a;
      b = xsum(b, a);

      sex = angle(cv, ii, 2. + t);
      e = rad(sex, 1. - t);
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a;
      b = xsum(b, a);

    }
  }

  a = 0.;
  a = fract(a + quantize(fract(tatan(ov) + 0.), 6.));
  a += fract(x / 36.);
  c = b * hsv2rgb(vec3(a, 3./4., 5./6.));
  c -= y;

  fragColor = vec4(c, 1);
}
