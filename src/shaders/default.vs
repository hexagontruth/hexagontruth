#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

in vec2 vertexPosition;
void main() {
  gl_Position = vec4(vertexPosition.xy, 0, 1);
}
