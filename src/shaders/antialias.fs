#version 100

precision highp float;
uniform vec2 size;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;

  vec4 s, n;

  vec2 offsets[4];
  offsets[0] = vec2(1, 0);
  offsets[1] = vec2(0, 1);
  offsets[2] = vec2(-1, 0);
  offsets[3] = vec2(0, -1);

  s = texture2D(inputTexture, uv);
  for (int i = 0; i < 4; i++) {
    vec2 v;
    v = offsets[i];
    v = v / size;
    n += texture2D(inputTexture, uv + v);
  }
  s = mix(s, n / 4., 0.5);
  gl_FragColor = s;
}
