#include common.fs

uniform sampler2D mainTexture;
uniform sampler2D videoTexture;
uniform float startCounter;
uniform float srcCounter;

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  cv *= cover;
  vec2 dv = cv * 0.5 + 0.5;
  vec4 c = unit.yyyx;
  vec4 last;
  c = texture(videoTexture, dv);
  last = texture(lastTexture, dv);
  c.a = clamp((counter - startCounter) / 60., 0., 1.);
  if (counter - startCounter > 60.)
  c = mix(last, c, clamp((counter - srcCounter) / 60., 0., 1.));
  vec3 hex = cart2hex * dv;

  // c = mix(c, texture(lastTexture, dv), 0.5);
  // c.a = c.a * smoothstep(0., 1./256., amax(c.rgb));
  // c.b *= clamp((counter - srcCounter) / 100., 0., 1.);
  // c.b = uv.y;
  // c.g = c.a;
  c = unit.xyyx;
  fragColor = c;
}
