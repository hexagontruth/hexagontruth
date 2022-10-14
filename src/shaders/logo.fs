#include common.fs

float istep(float n, float v) {
  return 1. - step(n, v);
}

vec3 angle(vec2 cv, float i, float d) {
  return cart2hex * (cv + rot(unit.xy, i/6. * tau) * d);
}

float rad(vec3 hex, float r) {
  return amax(hex) - r;
}

void main() {
  vec3 c, d, cc, dd;
  c = unit.yyy;
  vec2 uv, cv, ov, vv, v;
  uv = gl_FragCoord.xy / size;
  ov = uv * 2. - 1.;
  vec3 hex, gex, sex, pix, cel, samp, p[3], dist, bg;
  float a, b, b1, e, r, n, x, x1, x2, y, z, q, s, w, t, te, ts, scale;

  scale = 3.;
  s = scale;
  ov *= scale;
  cv = ov;
  q = 1./1024. * scale * sr3 * 4./3.;
  w = 1./1024. * scale * sr3 * 4./3.;
  t = smoothstep(0., 1., time);
  ts = clamp(t * 2., 0., 1.);
  te = clamp(t * 2., 1., 2.) - 1.;

  hex = cart2hex * cv;;

  e = rad(hex, t * 2.);
  a = istep(0., e);
  y = max(y, qw(abs(e), q * s, w * s));
  x += a;
  b = xsum(b, a);

  e = rad(hex, ts);
  a = istep(0., e);
  y = max(y, qw(abs(e), q * s, w * s));
  x += a;
  b = xsum(b, a);

  // e = rad(hex, 1. + t);
  // a = istep(0., e);
  // y = max(y, qw(abs(e), q * s, w * s));
  // x += a;
  // b = xsum(b, a);

  for (int i = 0; i < 6; i++) {
    float ii = float(i);

    sex = angle(cv, ii, 1. + t);
    e = rad(sex, t);
    a = istep(0., e);
    y = max(y, qw(abs(e), q * s, w * s));
    x += a;// * float(i + 1);
    b = xsum(b, a);

    // e = rad(sex, 1. - t);
    // a = istep(0., e);
    // y = max(y, qw(abs(e), q * s, w * s));
    // x += a;
    // b = xsum(b, a);

  }
  // b = xsum(b, quantize(amax(hex / 2.), 8.));
  c = vec3(xsum(0., b));
  // c *= (2. - length(hex) * 0.5) / 2.;
  c = clamp(c, 0., 1.);

  c = mix(unit.xxx * 1./8., unit.xxx * 7./8., c);

  b = b * (1. - step(3., x));
  c = mix(unit.yyy, unit.xxx, b);


  // c.r += y;
  // c.x = x / 12.;
  // c.y = b * 0.75;
  // c.z = b * 5./6.;
  // c = hsv2rgb(c);

  fragColor = vec4(c, 1);
}
