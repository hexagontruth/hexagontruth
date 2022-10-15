#version 100

precision highp float;
uniform vec2 size;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;

  vec4 s, n;

  vec2 offsets[4];
  offsets[0] = vec2(1, 1);
  offsets[1] = vec2(-1, 1);
  offsets[2] = vec2(-1, -1);
  offsets[3] = vec2(1, -1);

  for (int i = 0; i < 4; i++) {
    vec2 v;
    v = offsets[i];
    v = v / size / 2.;
    n += texture2D(inputTexture, uv + v);
  }
  s = n / 4.;
  gl_FragColor = s;
}
