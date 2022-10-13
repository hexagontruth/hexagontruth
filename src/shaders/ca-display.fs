#include common.fs
#include ca-utils.fs

vec3 nbrs[7] = vec3[7](
  vec3(0, 0, 0),
  vec3(1, 0, -1), //1
  vec3(0, 1, -1), //2
  vec3(-1, 1, 0), //3
  vec3(-1, 0, 1), //4
  vec3(0, -1, 1), //5
  vec3(1, -1, 0) //6
);

vec3 nbrs2[6] = vec3[6](
  vec3(0, -1, 1), //5
  vec3(-1, 1, 0), //3
  vec3(1, 0, -1), //1
  vec3(0, 1, -1), //2
  vec3(1, -1, 0), //6
  vec3(-1, 0, 1) //4
);

float range = pow(2., 8.);

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

vec4 cellSample(vec3 hex, vec3 pix) {
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

void main() {
  vec3 c = unit.yyy;
  fragColor = unit.yyyx;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  cv.y *= size.y / size.x;
  // cv.y += parallax.y * 0.25;

  cv = cv.yx;
  vec4 bin;
  vec3 hex, pix, cel;

  float t = fract(counter / skip);

  bin = hexbin(cv, 1.);

  cv = bin.yx;

  hex = cart2hex * (cv * gridSize);

  pix = roundCubic(hex);
  cel = hex2hex * (hex - pix);
  vec4 s = sampNbr(pix);

  float r = amax(cel) - 0.5;

  r = r + 1. - smoothstep(0., 1., max(t, s.g));

  r = smoothstep(0.01, 0., r);

  c = mix(unit.yyy, hsv2rgb(vec3(s.x/16., 0.75, 5./6.)), step(1., s.x));
  
  c = s.xyz;
  c = c.rrr * r;

  c = clamp(c, 0., 1.) * htWhite;

  c = max(c, vec3(1./8.));

  fragColor = vec4(c, 1);
}
