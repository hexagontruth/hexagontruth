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
  cv *= cover;
  cv.y += parallax.y * 0.25;

  cv = cv.yx;
  vec4 bin;
  vec3 hex, cel;

  vec3 dist, p[3], n[6];

  float t, ts, q, qc;
  t = fract(counter / skip);
  ts = smoothstep(0., 0.5, t);
  q = 4./amax(size);
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

  vec4 s0, s1;
  vec3 p0, p1;
  vec2 c0, c1, cd0, cd1;
  float lx, ly, r, rm, rx, ry, d, gl, cc;
  vec2 max1, max2, min1, min2;

  p0 = p[0];
  cel = hex2hex * (hex - p0) * sr3;

  c0 = hex2cart * p0 / gridSize;
  cc = length(c0 - cv);
  s0 = sampNbr(p0);

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
  rx = mix(
    max(ts, s0.z) - rm,
    min(1. - ts, s0.z)- rm,
    1. - s0.x
  );
  ry = mix(
    max(ts, s0.w) - rm,
    min(1. - ts, s0.w)- rm,
    1. - s0.y
  );

  for (int i = 0; i < 6; i++) {
    if (i > 1 && cc > LW)
      break;
    p1 = n[i];
    c1 = hex2cart * p1 / gridSize;
    s1 = sampNbr(p1);
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
        cd0 = c1 + (c0 - c1) * max(min(s0[j], s0[k]), max((1. - ts) * s0[k], ts * s0[j]));
        cd1 = c0 + (c1 - c0) * max(min(s1[j], s1[k]), max((1. - ts) * s1[k], ts * s1[j]));

        if (length(c0 - cd0) < gl / 2. || length(c1 - cd1) < gl / 2.) {
          if (length(cd0 - cd1) > 0.01) {

            d = qw(slength(cd0, cd1, cv), q, LW);
            ly = max(ly, d);
          }
        }
      }
    }
  }

  c = unit.xxx * smoothstep(0., qc, ry) * 0.5;
  c += unit.xxx * smoothstep(0., qc, rx) * 0.25;

  // c = rgb2hsv(c);
  // c.x = amax(p0) / gridSize + time;
  // c.y = openStep(0., c.y) * 0.75;
  // c.z = min(c.z, 5. / 6.);
  // c = hsv2rgb(c);

  ly = min(ly, 1.);

  c = alphamul(c, unit.xxx, max(lx, ly));

  c = clamp(c, 0., 1.) * htWhite;

  fragColor = vec4(c, 1);
}
