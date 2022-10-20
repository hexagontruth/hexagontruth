#version 300 es
precision highp float;

out vec4 fragColor;
in vec4 vColor;

uniform float counter;
uniform float duration;
uniform float time;
uniform float skipInterval;
uniform float skipTime;
uniform bool skip;
uniform float clock;

uniform vec2 size;
uniform vec2 cover;
uniform vec2 contain;
uniform vec2 lastSize;
uniform vec2 parallax;
uniform vec2 dir;
uniform float aspect;

uniform float resizeAt;
uniform bool resize;
uniform float cursorDownAt;
uniform float cursorUpAt;
uniform vec2 cursorPos;
uniform vec2 cursorLastPos;
uniform vec2 cursorDownPos;
uniform vec2 cursorUpPos;
uniform bool cursorDown;
uniform float cursorAngle;
uniform sampler2D inputTexture;
uniform sampler2D lastTexture;

vec3 unit = vec3(1, 0, -1);
#define pi 3.141592653589793
#define tau 6.283185307179586
#define sr2 1.4142135623730951
#define sr3 1.7320508075688772
