#include common.fs
#include ca-utils.fs

#define LW 1./360.

uniform vec2 autoscroll;

vec4 sampNbr(vec3 hex) {
    vec2 uv = cell2uv(hex, lastSize);
    return texture(inputTexture, uv);
}

void main() {
  vec3 c, color;
  fragColor = unit.yyyx;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv;
  float scale;
  // float stime;

  for (int h = 0; h < 1; h++) {
    // stime = fract(time + float(h) / 3.);
    // scale = 1./(gridSize) + smoothstep(1., 1./gridSize, stime) * 1.;
    scale = 1.;
    // stime = 1.;
    c = unit.yyy;
    cv = uv * 2. - 1.;
    cv *= cover;
    // cv += vec2(tsin(1./6.), tcos(1./6.)) * float(h);

    cv *= zoom;

    cv.y += parallax.y * 0.5;
    cv += dir / gridSize / 2.;
    cv += counter / duration / 2. * autoscroll;

    // cv.x += 0.00001; // weird centerline bugfix

    // cv = cv.yx;
    // cv = cv * scale;

    // cv = hexbin(cv, 1.).yx;

    vec3 hex, cel, ncel;
    vec3 dist, p[3], n[6];

    float d;
    float t, ts, te, q, qc, lw, lwc;

    vec4 s0, s1, b0, b1;
    vec3 p0, p1;
    vec2 c0, c1, cd0, cd1, ld, l0, l1;
    float r, rp, rx, ry, gl, cc, sl, lc;
    vec2 max1, max2, min1, min2;

    t = skipTime;
    ts = smoothstep(0., 0.5, t);
    te = smoothstep(0.5, 1., t);
    q = 4./amax(size) * scale * zoom;
    qc = q * gridSize * 2.; // I don't know why this needs to be multiplied by two?
    lw = 1./360. * scale * zoom;
    lwc = lw * gridSize * 2.;
    rp = 1./12.;



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

    p0 = p[0];
    cel = hex2hex * (hex - p0) * sr3;

    c0 = hex2cart * p0 / gridSize;
    cc = length(c0 - cv);
    s0 = sampNbr(p0);
    // s0.xz *= 8./9.;
    b0 = openStep(0., s0);

    max1 = vec2(
      amax(s0.xz),
      amax(s0.yw)
    );
    min1 = vec2(
      amin(s0.xy),
      amin(s0.zw)
    );

    ld += 100.;
    d += 100.;
    gl = length(c0 - hex2cart * n[0] / gridSize);

    ncel = (hex - p0) * 2.;
    r = amax(ncel) / (2.);
    // rx = mix(
    //   smoothstep(0., 1., s0.z - (s0.z - s0.x) * t),
    //   max(te, s0.z),
    //   openStep(0., s0.x - s0.z)
    // ) - r;
    ry = mix(
      min(1. - ts, s0.w),
      max(ts, s0.w),
      b0.y
    );
    d = mix(d, min(d, abs(ry -r)), amax(b0.yw) * step(0.5, 1. - t));

    for (int i = 0; i < 6; i++) {
      p1 = n[i];
      c1 = hex2cart * p1 / gridSize;
      s1 = sampNbr(p1);
      b1 = openStep(0., s1);

      ncel = (hex - p1) * 2.;
      r = amax(ncel) / (2.);
      // rx = mix(
      //   smoothstep(0., 1., s1.z - (s1.z - s1.x) * t),
      //   max(te, s1.z),
      //   openStep(0., s1.x - s1.z)
      // ) - r;
      ry = mix(
        min(1. - ts, s1.w),
        max(ts, s1.w),
        b1.y
      );
      d = min(d, abs(ry - r));

      if (i > 1 && cc > lw * 4.)
        break;

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

    rx = mix(
      smoothstep(0.25, 1., s0.z - (s0.z - s0.x) * t),
      max(te, s0.z),
      openStep(0., s0.x - s0.z)
    );
    ry = mix(
      min(1. - ts, s0.w),
      max(ts, s0.w),
      b0.y
    );

    r = length(cel) * sr3 / 2. / (1. - rp * 2.);
    c += unit.xxx * qs(rx - r, qc) * 0.25 * smoothstep(1./16., 1./8., rx);
    r = amax(cel) / (1. - rp);
    c += unit.xxx * qs(ry - r, qc) * 0.5;

    l0 = qw(ld, q, lw);
    l1 = qw(ld, q, lw * 3.);
    lc = max(l0.x * (1. - l1.y), xsum(l0.y, l1.y));

    c = alphamul(c, unit.xxx, lc * 0.5);
    // c = alphamul(c, hsv2rgb(vec3(
    //   quantize(amax(hex / gridSize), gridSize) + s0.x,
    //   0.75,
    //   1.
    // )), max(l0.x * (1. - l1.y), xsum(l0.y, l1.y)) * 0.5);
    // c *= smoothstep(1., 2./3., stime);
    // c *= smoothstep(0., 1./2., stime);

    d = qw(d, qc / 2., lwc / 2.);
    d = max(0., d - max(l0.x, l1.y));
    c = alphamul(c, unit.xxx, d * 0.25);

    // Color line bands -- requires changing loop escape radius
    // l0 = qw(ld, q, lw * vec2(5., 9.));
    // l1 = qw(ld, q, lw * vec2(7., 11.));
    // lc = xsum(l0.x, l1.x);
    // c = alphamul(c, hsv2rgb(vec3(
    //   amax(hex) / gridSize * 1.5 - time,
    //   0.75,
    //   1.
    // )), lc * 0.75);

    color = max(color, c);
  }
  color = clamp(color, 0., 1.) * htWhite;
  fragColor = vec4(color, 1);
}
