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
    return texture(lastTexture, uv);
}

vec4 rule(vec3 hex, float p) {
  vec4 cur, next;
  float n, map;

  cur = getNbr(hex);
  for (int i = 0; i < 6; i++) {
    vec3 v = nbrs[i + 1];
    vec4 nbr = getNbr(hex + v);
    n += openStep(0., nbr.x);
    map += openStep(0., nbr.y) * pow(2., float(i));
  }
  next = cur;

  if (
    (
      map == 32. + 16. ||
      map == 16. + 8. ||
      map == 8. + 4. ||
      map == 4. + 2. ||
      map == 2. + 1. ||
      map == 1. + 32. ||

      map == 32. + 4. ||
      map == 16. + 2. ||
      map == 8. + 1.
    ) ||
      cur.y > 0. && (
      map == 1. + 4. + 16. ||
      map == 2. + 8. + 32.
    )

  ) {
    next.y = 1.;
  }
  else {
    next.y = 0.;
  }

  if (cur.x == 0. && n == 1.) {
    next.x = 1.;
  }
  else {
    next.x = max(0., cur.x - 1./8.);
  }

  next.zw = cur.xy;

  return next;
}

void main() {
  vec4 c;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  // cv.y *= size.y / size.x;
  // cv.y += parallax.y * 0.25;
  vec3 hex = uv2cell(uv);

  // fragColor = hsv2rgb(vec4(amax(hex)/gridSize, 1, 1, 1));
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
    vec3(2, -1, -1),
    vec3(-1, 2, -1)
    // vec3(1, -2, 1),
    // vec3(1, 1, -2),
    // vec3(-2, 1, 1)
  );

  if (counter == 0.) {
    for (int i = 0, j = 0; i < 10; i++) {
      if (hex == seed[i]) {
        c.y += 1.;
        j++;
      }
      if (hex == -seed[i] && amax(hex) > 1.) {
        c.x += 1.;
        j++;
      }
      if (j > 1) break;
    }
    // c.x = 1. - step(1., amax(hex));
  }
  else if (skip) {
    c = rule(hex, d);
  }
  else {
    c = texture(lastTexture, uv);
  }

  fragColor = vec4(c);
}
