#include common.fs
#include ca-utils.fs

uniform sampler2D noiseTexture;

vec4 getNbr(vec3 hex) {
    vec2 uv = cell2uv(hex);
    return texture(lastTexture, uv);
}

vec4 rule(vec3 hex) {
  vec4 cur, next;
  cur = getNbr(hex);
  next = cur;
  return next;
}

void main() {
  vec4 c;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  // cv.y *= size.y / size.x;
  // cv.y += parallax.y * 0.25;
  vec3 hex = uv2cell(uv);

  c = rule(hex);

  float cursor = float(cursorDown) * max(0., 1. - amax(cursorHexRounded - hex));
  c.r += cursor * (float(shiftKey) * -2. + 1.);

  fragColor = vec4(c);
}
