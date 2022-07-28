#include header.fs;

float freq = 1.;
float core = 30.;
float prism = 10.;

uniform float gridSize;
uniform float animationSteps;

float stepInterval() {
  return fract(counter / animationSteps);
}

vec3 uv2cellOriginal(vec2 uv) {
  uv = uv * 2. - 1.;
  uv += 0.5/size;

  float s = size.x / 2.;
  float g = gridSize;
  vec3 hex, pix, cel;
  hex = vec3(uv, -uv.x -uv.y);
  hex = hex * s/ g;

  hex = hex2hex(hex / sr3);

  pix = roundCubic(hex);
  cel = hex - pix;
  cel = hex2hex(cel * sr3);
  cel *= g;
  cel = roundCubic(cel);
  return cel;
}

vec3 uv2cell(vec2 uv) {
  uv = (uv * 2. - 1.);

  uv += 0.5/size;

  float s = size.x / 2.;
  float g = gridSize;
  vec3 hex, pix, cel;
  hex = vec3(uv, -uv.x -uv.y);
  hex = hex * s/ g;

  hex = hex2hex(hex / sr3);

  pix = roundCubic(hex);
  cel = hex - pix;
  cel = hex2hex(cel * sr3);
  cel *= g;
  cel = roundCubic(cel);
  return cel;
}

vec2 cell2uv(vec3 hex) {
  vec2 uv = -hex.yz;
  uv = uv / size + 0.5;
  uv -= 0.5/size;
  return uv;
}


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

float range = pow(2., 8.);


vec4 getNbr(vec3 hex) {
    vec2 uv = cell2uv(hex);
    return texture(inputTexture, uv +0./size);
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

vec4 rule(vec3 hex, float p) {
  float a, v, s;
  vec3 n, nbr, k, c;
  vec4 next, cur;
  float midx, d;
  midx = 0.;
  // midx = step(1440., amax(hex));

  k = mix(consts[0], consts[1], midx);

  // k.y -= clamp(counter / 1440., 0., 1.) * 1./16.; 
  // if (amax(hex) >= prism * 2.)
  //   k.z = 1./2.;

  cur = getNbr(hex);
  c = unpack(cur);

  // k.z += cur.z > 0.5 ? -1./16. : 1./16.;

  // k.x *= 1. - smoothstep(0.75, 1., cur.x);
  // k.y *= 1. - smoothstep(0.75, 1., cur.y);
  // k.z *= 1. - smoothstep(0.75, 1., cur.z);

  for (int i = 0; i < 6; i++) {
    vec3 v = nbrs[i + 1];
    nbr = unpack(getNbr(hex + v));
    // if (amax(hex + v) > gridSize)
    //   nbr = unit.yyy;
    n += nbr;
    d += 1.;//(5. - amax(v))/4.;
  }

  a = (n.z - c.z * d) * k.x;
  v = (c.y + a) * k.y;
  s = (c.z + v) * k.z;

  if (abs(s) > range) {
    s = sign(s) * (range - (abs(s) - range) * 1.);
    // v = v * -1.;
  }

  s = sign(s) * ceil(abs(s));
  

  a = c.z;

  if (counter == 0.) {
    // return vec4(1,1,1,1);
    s =  step(0., amax(hex) - prism) * 2. - 1.;
    // s = 1.;
    s = c.z + s * range * 16./16. * -1.;
    a = s;
  }

  next = pack(vec3(a, v, s));

  return next;
}

void main() {
  vec4 c = fragColor = unit.yyyx;
  vec2 uv = gl_FragCoord.xy / size;
  vec3 hex = uv2cell(uv);

  fragColor = hsv2rgb(vec4(amax(hex)/gridSize, 1, 1, 1));
  // return;

  float r, d, e;



  // if (fract(time * 1.) == 0.) {
  //   c.rgba = unit.yyyy;
  //   c.z += (1. - step(prism, amax(hex)));
  //   // c.g += (1. - step(prism, vmax(-hex)));
  //   // c.g -= (1. - step(prism, amax(hex)));
  //   // c *= 1./4.;
  //   c.a = 0.75;
  // }
  // else
  c = rule(hex, d);


  // c = unit.yyyx;
  // c.r += counter/256.;
  // if (counter > 0.) {
  //   vec4 samp = texture(sBuffer, uv);
  //   samp = round(samp * 256.)/256.;
  //   if (samp.r == (counter-1.)/256.)
  //     c.g = 1.;
  // }

  // c.g += qw(osc(uv.x - time - 0.5), 1./360., 1./360.);
  fragColor = vec4(c);
}
