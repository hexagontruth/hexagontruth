#version 300 es

precision highp float;
out vec4 fragColor;
uniform vec2 size;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;

  vec4 s, n;

  vec2 offsets[4] = vec2[4](
    vec2(1, 0),
    vec2(0, 1),
    vec2(-1, 0),
    vec2(0, -1)
  );
  s = texture(inputTexture, uv);
  for (int i = 0; i < 4; i++) {
    vec2 v;
    v = offsets[i];
    v = v / size;
    n += texture(inputTexture, uv + v);
  }
  s = mix(s, n / 4., 0.5);
  fragColor = s;
}
