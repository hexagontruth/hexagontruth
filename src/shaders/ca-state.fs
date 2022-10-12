#include common.fs
#include ca-utils.fs

uniform sampler2D noiseTexture;

vec3 nbrs[6] = vec3[6](
  vec3(1, 0, -1),
  vec3(0, 1, -1),
  vec3(-1, 1, 0),
  vec3(-1, 0, 1),
  vec3(0, -1, 1),
  vec3(1, -1, 0)
);

vec4 getNbr(vec3 hex) {
    vec2 uv = cell2uv(hex);
    return texture(lastTexture, uv);
}

vec4 rule(vec3 hex, float p) {
  vec4 cur, next;
  float n, map;

  cur = getNbr(hex);
  for (int i = 0; i < 6; i++) {
    vec3 v = nbrs[i];
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
    next.y = 1.;
  }
  else {
    next.x = max(0., cur.x - 1./8. - 1./8. * next.y);
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


  // vec3 seed[10] = vec3[10](
  //   vec3(0, 0, 0),

  //   vec3(-1, 0, 1),
  //   vec3(0, -1, 1),
  //   vec3(1, -1, 0),
  //   vec3(1, 0, -1),
  //   vec3(0, 1, -1),
  //   vec3(-1, 1, 0),
  //   vec3(-1, -1, 2),
  //   vec3(2, -1, -1),
  //   vec3(-1, 2, -1)
  //   // vec3(1, -2, 1),
  //   // vec3(1, 1, -2),
  //   // vec3(-2, 1, 1)
  // );

  if (counter == 0.) {
    // for (int i = 0, j = 0; i < 10; i++) {
    //   if (hex == seed[i]) {
    //     c.y += 1.;
    //     j++;
    //   }
    //   if (hex == -seed[i] && amax(hex) > 1.) {
    //     c.x += 1.;
    //     j++;
    //   }
    //   if (j > 1) break;
    // }
    vec2 v = hex2cart * hex / gridSize;
    v = v * 0.5 + 0.5;
    vec2 tx = texture(noiseTexture, v).xy;
    tx = openStep(0., tx);
    c.xy = tx;
  }
  else if (skip) {
    c = rule(hex, d);
  }
  else {
    c = texture(lastTexture, uv);
  }

  fragColor = vec4(c);
}
