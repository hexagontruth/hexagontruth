#include common.fs
#include ca-utils.fs

vec4 getNbr(vec3 hex) {
    vec2 uv = cell2uv(hex);
    return texture2D(inputTexture, uv);
}

vec4 rule(vec3 hex, float p) {
  vec3 nbrs[7];
  nbrs[0] = vec3(0, 0, 0);
  nbrs[1] = vec3(1, 0, -1);
  nbrs[2] = vec3(0, 1, -1);
  nbrs[3] = vec3(-1, 1, 0);
  nbrs[4] = vec3(-1, 0, 1);
  nbrs[5] = vec3(0, -1, 1);
  nbrs[6] = vec3(1, -1, 0);

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
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  vec4 c;

  vec3 hex = uv2cell(uv);

  float r, d, e;

  vec3 seed[10];
  seed[0] = vec3(0, 0, 0),
  seed[1] = vec3(-1, 0, 1);
  seed[2] = vec3(0, -1, 1);
  seed[3] = vec3(1, -1, 0);
  seed[4] = vec3(1, 0, -1);
  seed[5] = vec3(0, 1, -1);
  seed[6] = vec3(-1, 1, 0);

  seed[7] = vec3(-1, -1, 2);
  seed[8] = vec3(2, -1, -1);
  seed[9] = vec3(-1, 2, -1);

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
    c = texture2D(inputTexture, uv);
  }
  gl_FragColor = vec4(c);
}
