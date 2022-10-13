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
  vec3 c, d, cc, dd;
  c = unit.yyy;
  vec2 uv, cv, ov, vv, v;
  uv = gl_FragCoord.xy / size;
  ov = uv * 2. - 1.;
  vec3 hex, gex, sex, pix, cel, samp, p[3], dist;
  float a, b, b1, e, r, n, x, x1, x2, y, z, q, s, w, t, t1, scale;

  ov.x *= size.x / size.y;
  ov.y += parallax.y * 0.25;
  ov += dir/10.;

  // if (cursorDown) {
  //   float t = counter - cursorDownAt;
  //   vec2 dir = vec2(cos(cursorAngle), sin(cursorAngle));
  //   ov -= dir * t / 30.;
  // }

  scale = 6.;
  ov *= scale;
  cv = ov;

  q = 2./size.y * scale * sr3 ;
  w = 1./720. * scale * sr3;

  hex = cart2hex * cv;

  a = 0.;

  b = xsum(b, a);
  for (int j = 0; j <4; j++) {
    // if (j != 3) continue;
    // b = a;
    float jj = float(j);
    t = fract(time + jj/4.);
    // t = time;
    s = 1. / (1. + jj);
    // s = (1. + jj) / 4.;
    cv = ov * s;
    t1 = fract(t + 0.5);
    x1 = x2 = 0.;
    for (int i = 0; i < 6; i++) {
      float ii = float(i);
      float coef;
      coef = (1. + ii);
      coef = 1.;
      sex = angle(cv, ii, 0.);
      e = rad(sex, 2. * max(0., t - 0.5));
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a * coef;
      b = xsum(b, a);

      sex = angle(cv, ii, 2. * t);
      e = rad(sex, 1.);
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a * coef;
      b = xsum(b, a);

      sex = angle(cv, ii, 2. + t);
      e = rad(sex, 1. - t);
      a = istep(0., e);
      y = max(y, qw(abs(e), q * s, w * s));
      x += a * coef;
      b = xsum(b, a);

    }
  }
  // b = xsum(b, quantize(amax(hex / 2.), 8.));
  c = vec3(xsum(0., b));
  // c *= (2. - length(hex) * 0.5) / 2.;
  c = clamp(c, 0., 1.);

  b = 0.;
  // b = quantize(fract(amax(hex)/4. - 0.), 4.)/5.;
  b = fract(b + quantize(fract(tatan(ov) + 0.), 6.));
  b += fract(x / 36.);
  d = hsv2rgb(vec3(b, 3./4., 5./6.));


  c = c * d;

  c -= y;

  // c = max(c, unit.xxx * 1. / 8.);

  fragColor = vec4(c, 1);
}
