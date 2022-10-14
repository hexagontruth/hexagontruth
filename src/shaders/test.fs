#version 300 es
precision highp float;
out vec4 fragColor;
in vec4 vColor;
uniform vec2 size;
uniform vec2 lastSize;
uniform vec2 parallax;
uniform vec2 dir;
uniform float counter;
uniform float time;
uniform float clock;
uniform bool resize;
uniform float cursorDownAt;
uniform float cursorUpAt;
uniform vec2 cursorPos;
uniform vec2 cursorLastPos;
uniform vec2 cursorDownPos;
uniform vec2 cursorUpPos;
uniform bool cursorDown;
uniform float cursorAngle;
uniform sampler2D inputTexture;
uniform sampler2D lastTexture;

vec3 unit = vec3(1, 0, -1);
#define pi 3.141592653589793
#define tau 6.283185307179586
#define sr2 1.4142135623730951
#define sr3 1.7320508075688772

float quantize(float f, float n, float ep) {
  return floor(clamp(f * n, 0., n - ep)) / n;
}

float quantize(float f, float n) {
  return quantize(f, n, 1./16384.);
}

float amax(vec3 v) {
  return max(max(abs(v.x), abs(v.y)), abs(v.z));
}

float sum(vec3 p) {
  return p.x + p.y + p.z;
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
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  vec3 hex, dist, p[3];

  hex = c2h(cv * 2.);
  dist = ic(hex, p);
  float m = quantize(amax(hex - p[0]), 32.);
  fragColor = vec4(vec3(m), 1);
}
