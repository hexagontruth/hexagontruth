#version 300 es

precision highp float;
out vec4 fragColor;
uniform vec2 size;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  fragColor = vec4(texture(inputTexture, uv).rgb, 1);
}
