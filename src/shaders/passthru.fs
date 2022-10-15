#version 100

precision highp float;
uniform vec2 size;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  gl_FragColor = texture2D(inputTexture, uv);
}
