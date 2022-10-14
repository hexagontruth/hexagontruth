#include common.fs
#include ca-utils.fs

vec3 nbrs[61] = vec3[61](
  vec3(0, 0, 0),

  vec3(1, 0, -1),
  vec3(0, 1, -1),
  vec3(-1, 1, 0),
  vec3(-1, 0, 1),
  vec3(0, -1, 1),
  vec3(1, -1, 0),

  vec3(2, 0, -2),
  vec3(0, 2, -2),
  vec3(-2, 2, 0),
  vec3(-2, 0, 2),
  vec3(0, -2, 2),
  vec3(2, -2, 0),

  vec3(1, 1, -2),
  vec3(1, -2, 1),
  vec3(-2, 1, 1),
  vec3(-1, -1, 2),
  vec3(-1, 2, -1),
  vec3(2, -1, -1),

  vec3(3, 0, -3),
  vec3(0, 3, -3),
  vec3(-3, 3, 0),
  vec3(-3, 0, 3),
  vec3(0, -3, 3),
  vec3(3, -3, 0),

  vec3(-3, 2, 1),
  vec3(2, 1, -3),
  vec3(1, -3, 2),
  vec3(3, -2, -1),
  vec3(-2, -1, 3),
  vec3(-1, 3, -2),

  vec3(1, 2, -3),
  vec3(2, -3, 1),
  vec3(-3, 1, 2),
  vec3(-1, -2, 3),
  vec3(-2, 3, -1),
  vec3(3, -1, -2),

  vec3(4, 0, -4),
  vec3(0, 4, -4),
  vec3(-4, 4, 0),
  vec3(-4, 0, 4),
  vec3(0, -4, 4),
  vec3(4, -4, 0),

  vec3(4, -1, -3),
  vec3(-1, 4, -3),
  vec3(-3, 4, -1),
  vec3(-3, -1, 4),
  vec3(-1, -3, 4),
  vec3(4, -3, -1),

  vec3(4, -2, -2),
  vec3(-2, 4, -2),
  vec3(-2, -2, 4),
  vec3(-4, 2, 2),
  vec3(2, -4, 2),
  vec3(2, 2, -4),

  vec3(3, 1, -4),
  vec3(1, 3, -4),
  vec3(-4, 3, 1),
  vec3(-4, 1, 3),
  vec3(1, -4, 3),
  vec3(3, -4, 1)
);

float kernel[19] = float[19](
  0.,

  0.15,
  0.25,
  0.5,
  0.25,
  -0.5,
  0.25,

  -1.,
  -1.,
  0.,
  1.,
  -9.,
  -1.,

  0.5,
  -0.8,
  0.5,
  10.8,
  -0.5,
  2.1
);

float hexSize = 1./3.;

vec3 consts[2] = vec3[2](
  vec3(
   1./12.,
    1. - 0./16.,
    1. + 0./256.
  ),
  vec3( 
    1./12.,
    1. - 0./64.,
    1. - 1./4.
  )
);

float range = pow(2., 6.);


vec4 getNbr(vec3 hex) {
    vec2 uv = cell2uv(hex);
    return texture(inputTexture, uv);
}

vec3 unpack(vec4 n) {
  vec3 s, m;
  n.w = fract(round(n.w * 64.) / 64.);
  s.x = mod(floor(n.w * 2.), 2.) * 2. - 1.;
  s.y = mod(floor(n.w * 4.), 2.) * 2. - 1.;
  s.z = mod(floor(n.w * 8.), 2.) * 2. - 1.;
  m = round(n.xyz * range) * s;
  return m;
}
vec4 pack(vec3 n) {
  float w;
  vec3 p, s;
  s = sign(n) * 0.5 + 0.5;
  s = mix(unit.yyy, s, abs(sign(n)));
  p = round(clamp(abs(n), 0., range)) / range;
  w = s.x * 1./2. + s.y * 1./4. + s.z * 1./8.;
  return vec4(p, w);
}

vec4 rule2(vec3 hex, float p) {
  vec3 n, next, nbr;
  vec3 cur, result;
  int i;
  float hc[6], hv[6];
  float nc, nv;
  cur = unpack(getNbr(hex));

  for (int i = 0; i < 6; i++) {
    // if (amax(hex + v) >= gridSize -1.) continue;
    vec3 v = nbrs[i + 1];
    nbr = unpack(getNbr(hex + v));
    n += nbr;
    hv[i] = nbr.x;
    hc[i] = step(1., nbr.x);
    nv += nbr.x;
  }
  nc = hc[0] *32. + hc[1] * 16. + hc[2] * 8. + hc[3] * 4. + hc[4] * 2. + hc[5];

  result = cur;
  if (
    nc == 32. + 16. ||
    nc == 16. + 8. ||
    nc == 8. + 4. ||
    nc == 4. + 2. ||
    nc == 2. + 1. ||
    nc == 1. + 32. ||

    nc == 32. + 4. ||
    nc == 16. + 2. ||
    nc == 8. + 1.
  ) {
    result.x += 1.;
  }
  else {
    result.x = 0.;
  }

  result = max(result, 0.);
  return pack(result);
}

vec4 rule(vec3 hex, float p) {
  vec4 cur, next;
  float n, map;

  cur = getNbr(hex);
  n = cur.x;
  for (int i = 0; i < 6; i++) {
    vec3 v = nbrs[i + 1];
    vec4 nbr = getNbr(hex + v);
    n += nbr.x;
    map += step(0.001, nbr.b) * pow(2., float(i));
  }

  next = cur;
  next.yw = cur.xz;
  next.x = n > 1. && n < 3. ? 1. : 0.;

  if (
    map == 32. + 16. ||
    map == 16. + 8. ||
    map == 8. + 4. ||
    map == 4. + 2. ||
    map == 2. + 1. ||
    map == 1. + 32. ||

    map == 32. + 4. ||
    map == 16. + 2. ||
    map == 8. + 1.
  ) {
    next.b = 1.;
  }
  else {
    next.b = 0.;
  }

  return next;
}

void main() {
  vec4 c = fragColor = unit.yyyx;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  // cv.y *= size.y / size.x;
  // cv.y += parallax.y * 0.25;
  vec3 hex = uv2cell(uv);

  fragColor = hsv2rgb(vec4(amax(hex)/gridSize, 1, 1, 1));
  // return;

  float r, d, e;


  vec3 seed[10] = vec3[10](
    vec3(0, 0, 0),

    vec3(-1, 0, 1),
    vec3(0, -1, 1),
    vec3(1, -1, 0),
    vec3(1, 0, -1),
    vec3(0, 1, -1),
    vec3(-1, 1, 0),

    vec3(-1, -1, 2),
    // vec3(1, -2, 1),
    vec3(2, -1, -1),
    // vec3(1, 1, -2),
    vec3(-1, 2, -1)
    // vec3(-2, 1, 1)
  );

  if (resize) {
    for (int i = 0; i < 10; i++) {
      if (hex == seed[i]) {
        c.b = 1.;
        break;
      }
    }
    if (amax(hex) < 8.) {
      c.rg += 1.;
    }
  }
  else if (mod(counter, skip) == 0.) {
    c = rule(hex, d);
  }
  else {
    c = texture(inputTexture, uv);
  }

  // c.xyzw = pack(vec3(30., 0, 0.));

  // c.rg = uv;
  fragColor = vec4(c);
}
