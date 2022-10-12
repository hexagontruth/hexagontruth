#version 300 es
precision highp float;
out vec4 fragColor;
in vec4 vColor;
uniform vec2 size;

uniform sampler2D noiseTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  // vec2 cv = uv * 2. - 1.;
  // cv *= cover;
  vec4 s;
  s = texture(noiseTexture, uv);
  // s.r = uv.y;
  fragColor = vec4(s.rgb, 1);
}
