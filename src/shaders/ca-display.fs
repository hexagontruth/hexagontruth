#include common.fs
#include ca-utils.fs

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

  vec3 dist, p[3];

  float t = fract(counter / skip);

  bin = hexbin(cv, 1.);

  cv = bin.yx;

  hex = cart2hex * (cv * gridSize);
  dist = interpolatedCubic(hex, p);

  vec4 s1, s2;
  vec3 p1, p2;
  vec2 c1, c2, cd;
  float lx, ly, r;
  float cur1max, cur2max, last1max, last2max, curxmax, curymax, lastxmax, lastymax;

  p1 = p[0];
  p2 = p[1];
  c1 = hex2cart * p1 / gridSize;
  c2 = hex2cart * p2 / gridSize;
  s1 = sampNbr(p1);
  s2 = sampNbr(p2);

  cur1max = amax(s1.xy);
  cur2max = amax(s2.xy);
  last1max = amax(s1.zw);
  last2max = amax(s2.zw);
  curxmax = max(s1.x, s2.x);
  curymax = max(s1.y, s2.y);
  lastxmax = max(s1.z, s2.z);
  lastymax = max(s1.w, s2.w);

  cel = hex2hex * (hex - p1) * sr3;
  r = amax(cel);

  lx = smoothstep(0.3, 0.2, amax(cel)) * s1.x;
  ly = smoothstep(0.3, 0.2, amax(cel)) * s1.y;

  if (curxmax > 0.) {
    cd = c2 - c1 * c2.x;
    lx = max(lx, smoothstep(0.002, 0.001, slength(c1, cd, cv)));

  }
  if (curymax > 0.) {
    cd = c2 - c1 * c2.y;
    ly = max(ly, smoothstep(0.002, 0.001, slength(c1, c2, cv)));
  }

  r = r  + 1./12.- smoothstep(0., 0.5, max(t, s1.g));
  r = smoothstep(1./24., -1./24., r);
  
  c = s1.xyz;
  c = c.xxy * r;

  c = rgb2hsv(c);
  c.x = amax(p1) / gridSize + time;
  c.y = openStep(0., c.y) * 0.75;
  c.z = min(c.z, 5. / 6.);
  c = hsv2rgb(c);

  c += max(lx, ly);


  c = clamp(c, 0., 1.) * htWhite;

  fragColor = vec4(c, 1);
}
