#include common.fs
#include ca-utils.fs

uniform sampler2D noiseTexture;

uniform sampler2D[3] textureArray;

vec4 sampCell(vec3 hex) {
  vec2 uv = cell2uv(hex);
  return texture(lastTexture, uv);
}

vec4 sampCursor(vec3 hex) {
  vec2 uv = cell2uv(hex);
  return texture(textureArray[0], uv);
}

vec3 nbrs[6] = vec3[6](
  vec3(1, 0, -1),
  vec3(0, 1, -1),
  vec3(-1, 1, 0),
  vec3(-1, 0, 1),
  vec3(0, -1, 1),
  vec3(1, -1, 0)
);

vec4 rule(vec3 hex) {
  vec4 cur, next;
  float n, map;

  cur = sampCell(hex);
  for (int i = 0; i < 6; i++) {
    vec3 v = nbrs[i];
    vec4 nbr = sampCell(hex + v);
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
  vec3 hex = uv2cell(uv);

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
    c.xy *= (1. - float(shiftKey));
  }
  else if (skip) {
    c = rule(hex);
  }
  else {
    c = texture(lastTexture, uv);
  }

  vec2 click = sampCursor(hex).xy;

  c += step(1., click.x) - step(1., click.y);


  fragColor = vec4(c);
}
