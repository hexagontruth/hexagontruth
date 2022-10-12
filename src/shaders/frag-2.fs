#include common.fs

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  vec4 s = texture(inputTexture, uv);
  //s = mix(s, 1. - s, step(0.5, uv.x));
  if (cursorDown) {
    float a = length(cv - cursorPos);
    a = smoothstep((counter - cursorDownAt)/100., 0., a);
    s.rgb += a;
  }
  // s = mix(s, texture(lastTexture, uv), 0.95);
  fragColor = vec4(s.rgb, 1);
}
