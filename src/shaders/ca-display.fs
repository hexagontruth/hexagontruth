#include common.fs
#include ca-utils.fs

vec4 sampNbr(vec3 hex) {
    vec2 uv = cell2uv(hex, lastSize);
    return texture(inputTexture, uv);
}

vec4 interpSample(vec3 hex, vec3 pix) {
  vec4 psamp;
  vec4 usamp, samp;
  vec3 n[3], wts;

  wts = interpolatedCubic(hex, n);
  for (int i = 0; i < 3; i++) {
    psamp = sampNbr(n[i]);
    usamp = (psamp);// * 4.;
    // usamp = -1. * usamp;
    // usamp = usamp/256.;
    samp += usamp * wts[i];
  }
  return samp;
}

vec3 ic(vec3 p, out vec3 v[3]) {
  vec3 q, d, r, fl, cl, alt;
  int i0, i1, i2;

  fl = floor(p);
  cl = ceil(p);
  r = round(p);
  d = abs(r - p);

  for (int i = 0; i < 3; i++)
    alt[i] = r[i] == fl[i] ? cl[i] : fl[i];

  if (d.x > d.y && d.x > d.z)
    i0 = 0;
  else if (d.y > d.z)
    i0 = 1;
  else
    i0 = 2;
  i1 = (i0 + 1) % 3;
  i2 = (i0 + 2) % 3;

  r[i0] = -r[i1] - r[i2];
  v[0] = v[1] = v[2] = r;
  v[1][i1] = alt[i1];
  v[1][i0] = -v[1][i1] - v[1][i2];
  v[2][i2] = alt[i2];
  v[2][i0] = -v[2][i1] - v[2][i2];

  for (int i = 0; i < 3; i++)
    q[i] = 1. - amax(v[i] - p);

  q = q / sum(q);

  // I don't remember how the rest of this function even works so I'm just adding this here
  if (q.y < q.z) {
    q.yz = q.zy;
    vec3 temp = v[1];
    v[1] = v[2];
    v[2] = temp;
  }
  return q;
}


vec3 c2h(vec2 c) {
  vec3 hex;
  hex.y = (c.x - c.y * 1. / sr3);
  hex.z =  c.y * 2. / sr3;
  hex.x = -hex.z - hex.y;
  return hex;
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
  vec3 hex, pix, cel;

  vec3 dist, p[3];

  float t = fract(counter / skip);

  bin = hexbin(cv, 1.);

  cv = bin.yx;

  hex = cart2hex * (cv * gridSize);
  dist = interpolatedCubic(hex, p);
  pix = p[0];

  float line;
  for (int i = 0; i < 3; i++ ) {
    vec4 s1, s2;
    vec3 p1, p2;
    vec2 c1, c2;
    p1 = p[i];
    p2 = p[(i + 1) % 3];
    c1 = hex2cart * p1 / gridSize;
    c2 = hex2cart * p2 / gridSize;
    s1 = sampNbr(p1);
    s2 = sampNbr(p2); 
    if (s1.x > 0. && s2.x > 0.) {
      line += smoothstep(0.002, 0.001, slength(c1, c2, cv));
    }
  }
  cel = hex2hex * (hex - pix) * sr3;


  vec4 s = sampNbr(pix);

  float r = amax(cel);
  r = r  + 1./12.- smoothstep(0., 0.5, max(t, s.g));
  r = smoothstep(1./24., -1./24., r);
  
  c = s.xyz;
  c = c.rrb * r;

  c = rgb2hsv(c);
  c.x = amax(pix) / gridSize + time;
  c.y = openStep(0., c.y) * 0.75;
  c.z = min(c.z, 5. / 6.);
  c = hsv2rgb(c);

  c += line;



  c = clamp(c, 0., 1.) * htWhite;

  fragColor = vec4(c, 1);
}
