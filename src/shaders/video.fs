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
  c = texture(videoTexture, dv);
    
  c.a = clamp((counter - startCounter) / 60., 0., 1.);
  // c.b *= clamp((counter - srcCounter) / 100., 0., 1.);
  // c.b = uv.y;
  // c.g = c.a;
  fragColor = c;
}
