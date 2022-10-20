#include common.fs
#include ca-utils.fs

#define LW 1./360.

vec4 sampNbr(vec3 hex) {
    vec2 uv = cell2uv(hex, lastSize);
    return texture(inputTexture, uv);
}

void main() {
  vec3 c = unit.yyy;
  fragColor = unit.yyyx;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  float scale;

  cv *= cover;
  cv.y += parallax.y * 0.25;

  cv = cv.yx;
  scale = 1.;//(1./3. + 2./3. * smoothstep(0., 720., counter - resizeAt));
  cv = cv * scale;

  vec4 bin;
  vec3 hex, cel;
  vec3 dist, p[3], n[6];

  float t, ts, te, q, qc, lw;

  lw = 1./360. * scale;
  t = fract(counter / skip);
  ts = smoothstep(0., 0.5, t);
  te = smoothstep(0.5, 1., t);
  q = 4./amax(size) * scale;
  qc = q * gridSize * 2.; // I don't know why this needs to be multiplied by two?

  bin = hexbin(cv, 1.);

  cv = bin.yx;

  hex = cart2hex * (cv * gridSize);
  dist = interpolatedCubic(hex, p);
  n = vec3[6](
    p[1],
    p[2],
    p[1] - p[2] + p[0],
    p[2] - p[1] + p[0],
    p[0] - p[1] + p[0],
    p[0] - p[2] + p[0]
  );

  vec4 s0, s1, b0, b1;
  vec3 p0, p1;
  vec2 c0, c1, cd0, cd1, ld, l0, l1;
  float r, rm, rx, ry, gl, cc, sl;
  vec2 max1, max2, min1, min2;

  p0 = p[0];
  cel = hex2hex * (hex - p0) * sr3;

  c0 = hex2cart * p0 / gridSize;
  cc = length(c0 - cv);
  s0 = sampNbr(p0);
  s0.xz *= 16./15.;
  b0 = openStep(0., s0);

  max1 = vec2(
    amax(s0.xz),
    amax(s0.yw)
  );
  min1 = vec2(
    amin(s0.xy),
    amin(s0.zw)
  );

  r = amax(cel);
  rm = r * 12. / 11.;
  ld += 100.;

  for (int i = 0; i < 6; i++) {
    if (i > 1 && cc > lw * 3.)
      break;
    p1 = n[i];
    c1 = hex2cart * p1 / gridSize;
    s1 = sampNbr(p1);
    b1 = openStep(0., s1);
    gl = length(c0 - c1);

    max2 = vec2(
      amax(s1.xz),
      amax(s1.yw)
    );
    min2 = vec2(
      amin(s1.xy),
      amin(s1.zw)
    );

    for (int j = 0; j < 2; j++) {
      int k = j + 2;
      if (max1[j] > 0. && max2[j] > 0.) {
        cd0 = c1 + (c0 - c1) * max(min(b0[j], b0[k]), max((1. - ts) * b0[k], ts * b0[j]));
        cd1 = c0 + (c1 - c0) * max(min(b1[j], b1[k]), max((1. - ts) * b1[k], ts * b1[j]));

        if (length(c0 - cd0) < gl / 2. || length(c1 - cd1) < gl / 2.) {
          if (length(cd0 - cd1) > 0.01) {
            sl = slength(cd0, cd1, cv);
            ld[j] = min(ld[j], sl);
          }
        }
      }
    }
  }
  l0 = qw(ld, q, lw);
  l1 = qw(ld, q, lw * 3.);

  rx = mix(
    // cv.x > 0. ? 0. : min(1. - ts, s0.z),
    smoothstep(0., 1., s0.z - (s0.z - s0.x) * t),
    max(te, s0.z),
    openStep(0., s0.x - s0.z)
  ) - rm;
  ry = mix(
    min(1. - ts, s0.w),
    max(ts, s0.w),
    b0.y
  ) - rm;

  c = unit.xxx * smoothstep(0., qc, ry) * 0.5;
  c += unit.xxx * smoothstep(0., qc, rx) * 0.25;
  // c.r += (1. - step(0.005, cc)) * openStep(0., s0.x - s0.z);
  // c = rgb2hsv(c);
  // c.x = amax(p0) / gridSize + time;
  // c.y = openStep(0., c.y) * 0.75;
  // c.z = min(c.z, 5. / 6.);
  // c = hsv2rgb(c);

  c = alphamul(c, unit.xxx, max(l0.x * (1. - l1.y), xsum(l0.y, l1.y)) * 0.5);

  c = clamp(c, 0., 1.) * htWhite;

  fragColor = vec4(c, 1);
}
