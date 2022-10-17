#include header.fs;

mat3x2 hex2cart = mat3x2(
  vec2(0, 0),
  vec2(1, 0),
  vec2(0.5, sr3 / 2.)
);

mat2x3 cart2hex = mat2x3(
  vec3(-1, 1, 0),
  vec3(-1. / sr3, -1. / sr3, 2. / sr3)
);

mat3 hex2hex = mat3(
  vec3(0, 0, 0),
  vec3(-1. / sr3, 2. / sr3, -1. / sr3),
  vec3(-2. / sr3, 1. / sr3, 1. / sr3)
);

vec3 htWhite = 1. - vec3(1./36., 1./24., 1./12.);

bool isNan(float n) {
  return !(n <= 0. || 0. <= n);
}

float amax(vec3 v) {
  return max(max(abs(v.x), abs(v.y)), abs(v.z));
}

float amax(vec2 v) {
  return max(abs(v.x), abs(v.y));
}

float amin(vec3 v) {
  v = abs(v);
  return min(min(v.x, v.y), v.z);
}

float amin(vec2 v) {
  v = abs(v);
  return min(v.x, v.y);
}

float osc(float n) {
  n -= 0.25;
  return sin(n * tau) * 0.5 + 0.5;
}

vec2 osc(vec2 n) {
  n -= 0.25;
  return sin(n * tau) * 0.5 + 0.5;
}
vec3 osc(vec3 n) {
  n -= 0.25;
  return sin(n * tau) * 0.5 + 0.5;
}

float tsin(float n) {
  return sin(n * tau);
}

float tcos(float n) {
  return cos(n * tau);
}

vec2 tsin(vec2 n) {
  return sin(n * tau);
}

vec2 tcos(vec2 n) {
  return cos(n * tau);
}

vec3 tsin(vec3 n) {
  return sin(n * tau);
}

vec3 tcos(vec3 n) {
  return cos(n * tau);
}

float sum(vec2 p) {
  return p.x + p.y;
}

float sum(vec3 p) {
  return p.x + p.y + p.z;
}

float prod(vec2 p) {
  return p.x * p.y;
}

float prod(vec3 p) {
  return p.x * p.y * p.z;
}

float xsum(float s, float q) {
  return s + q - 2. * s * q;
}

vec2 xsum(vec2 s, vec2 q) {
  return s + q - 2. * s * q;
}

vec3 xsum(vec3 s, vec3 q) {
  return s + q - 2. * s * q;
}

vec2 rot(vec2 p, float a) {
  float ca = cos(a);
  float sa = sin(a);
  return mat2(
    ca, sa,
    -sa, ca
  ) * p;
}

vec3 rot(vec3 p, vec3 u, float a) {
  float cosa = cos(a);
  float cosa1 = 1. - cosa;
  float sina = sin(a);
  mat3 m = mat3(
    cosa + u.x * u.x * cosa1,         u.x * u.y * cosa1 + u.z * sina,   u.z * u.x * cosa1 - u.y * sina,
    u.x * u.y * cosa1 - u.z * sina,   cosa + u.y * u.y * cosa1,         u.z * u.y * cosa1 + u.x * sina,
    u.x * u.z * cosa1 + u.y * sina,   u.y * u.z * cosa1 - u.x * sina,   cosa + u.z * u.z * cosa1
  );
  return m * p;
}

vec2 trot(vec2 p, float a) {
  return rot(p, a * tau);
}

vec3 trot(vec3 p, vec3 u, float a) {
  return rot(p, u, a * tau);
}

vec2 project(vec2 a, vec2 b) {
  return dot(a, b) / dot(b, b) * b;
}

vec3 project(vec3 a, vec3 b) {
  return dot(a, b) / dot(b, b) * b;
}

vec4 project(vec4 a, vec4 b) {
  return dot(a, b) / dot(b, b) * b;
}

vec3 hexProject(vec3 p) {
  vec3 n = project(p, unit.xxx);
  return p - n;
}

float tatan(vec2 v) {
  float a = atan(v.y, v.x);
  a += pi;
  a /= tau;
  a = fract(a - 0.25);
  a = 1. - a;
  return a;
}

vec4 dreflect(vec4 cv, vec4 n) {
  cv -= n * min(0., dot(cv, n)) * 2.;
  return cv;
}

vec3 dreflect(vec3 cv, vec3 n) {
  cv -= n * min(0., dot(cv, n)) * 2.;
  return cv;
}

vec2 dreflect(vec2 cv, vec2 n) {
  cv -= n * min(0., dot(cv, n)) * 2.;
  return cv;
}

vec2 dreflect(vec2 cv, float a) {
  vec2 n = vec2(cos(a), sin(a));
  cv -= n * min(0., dot(cv, n)) * 2.;
  return cv;
}

vec2 treflect(vec2 cv, float a) {
  return dreflect(cv, a * tau);
}

float qw(float n, float q, float w) {
  return smoothstep(w/2. + q/2., w/2. - q/2., abs(n));
}

float qwp(float n, float q, float w) {
  return qw(abs(fract(n + 0.5) - 0.5), q, w);
}

float openStep(float m, float n) {
  return 1. - step(m, -n);
}

float slength(vec2 u, vec2 v, vec2 p) {
  vec2 w, x, z;
  w = u - v;
  x = p - v;
  z = project(x, w);
  z = clamp(z, min(w, unit.yy), max(w, unit.yy));
  return length(z - x);
}

vec3 roundCubic(vec3 p) {
  vec3 r = round(p);
  vec3 d = abs(r - p);
  if (d.x > d.y && d.x > d.z)
    r.x = -r.y - r.z;
  else if (d.y > d.z)
    r.y = -r.x - r.z;
  else
    r.z = -r.x - r.y;
  return r;
}

vec3 interpolatedCubic(vec3 p, out vec3 v[3]) {
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

vec4 hexbin(vec2 cv, float s) {
  float res = s / 3.;
  vec2 base, dv;
  base = cv;
  cv *= res;

  vec2 r = vec2(1., 1. / sr3);
  r = vec2(r.y, r.x);
  vec2 h = r * 0.5;
  
  vec2 a = mod(cv, r) - h;
  vec2 b = mod(cv - h, r) - h;

  float delta = length  (a) - length  (b);
  dv = delta < 0. ? a : b;

  a = mod(base, r) - h;
  b = mod(base - h, r) - h;
  vec2 coord = length(a) < length(b) ? a : b;
  coord = (cv - dv) / res;
  dv *= 3.;
  return vec4(dv, coord);
}

float quantize(float f, float n, float ep) {
  return floor(clamp(f * n, 0., n - ep)) / n;
}

vec2 quantize(vec2 f, float n, float ep) {
  return floor(clamp(f * n, 0., n - ep)) / n;
}

vec3 quantize(vec3 f, float n, float ep) {
  return floor(clamp(f * n, 0., n - ep)) / n;
}

float quantize(float f, float n) {
  return quantize(f, n, 1./16384.);
}

vec2 quantize(vec2 f, float n) {
  return quantize(f, n, 1./16384.);
}

vec3 quantize(vec3 f, float n) {
  return quantize(f, n, 1./16384.);
}

// Color

vec4 rgb2hsv(vec4 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec4(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x, c.w);
}

vec4 hsv2rgb(vec4 c)
{
    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), c.w);
}

vec3 rgb2hsv(vec3 c) {
  return rgb2hsv(vec4(c, 1)).xyz;
}

vec3 hsv2rgb(vec3 c) {
  return hsv2rgb(vec4(c, 1)).xyz;
}
