/**
 * Holographic case cover.
 * Layers (bottom → top): printed artwork lit by a pointer-driven light, a specular glare, a sunburst
 * diffraction foil whose hue depends on the viewing angle, a diagonal light sweep that follows the tilt,
 * angle-dependent glitter, and a firelit (ignition orange) rim from below.
 */

export const coverVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWP;
varying vec3 vN;
varying vec3 vT;
varying vec3 vB;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  mat3 m = mat3(modelMatrix);
  vN = normalize(m * normal);
  vT = normalize(m * vec3(1.0, 0.0, 0.0));
  vB = normalize(m * vec3(0.0, 1.0, 0.0));
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const coverFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
uniform float uFoil;
uniform float uFire;
uniform float uGlare;
uniform vec3 uLight;
uniform vec3 uFireCol;
varying vec2 vUv;
varying vec3 vWP;
varying vec3 vN;
varying vec3 vT;
varying vec3 vB;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }

void main() {
  vec3 base = texture2D(uMap, vUv).rgb;
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vWP);
  vec3 L = normalize(uLight - vWP);
  vec2 v2 = vec2(dot(V, vT), dot(V, vB));
  vec2 l2 = vec2(dot(L, vT), dot(L, vB));
  float ndl = max(dot(N, L), 0.0);
  float lum = dot(base, vec3(0.299, 0.587, 0.114));

  // printed artwork, lit (kept close to the print so dark ink stays dark)
  vec3 col = base * (0.62 + 0.38 * ndl);
  float ink = 1.0 - smoothstep(0.08, 0.35, lum); // where the print is dark, foil sits behind it

  // glare
  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  col += vec3(1.0, 0.93, 0.84) * pow(nh, 90.0) * 0.32 * uGlare;

  // sunburst diffraction foil — zero offset at the mirror angle
  vec2 d = (vUv - vec2(0.5, 0.66)) * vec2(1.0, 1.44);
  float ang = atan(d.y, d.x);
  float rad = length(d);
  vec2 g = vec2(cos(ang), sin(ang));
  vec2 h = v2 + l2 * 0.6;
  float mirror = exp(-dot(h, h) * 4.0);
  float rays = pow(0.5 + 0.5 * cos(ang * 80.0), 2.0);
  float grain = vnoise(vUv * vec2(320.0, 460.0));
  vec3 holo = mix(hue(dot(h, g) * 2.2 + rad * 1.7 + grain * 0.08), vec3(1.0), 0.22);
  float amt = uFoil * (0.02 + 0.3 * mirror) * (0.3 + 0.7 * rays) * (0.35 + 0.65 * grain) * (1.0 - 0.75 * ink);
  // foil tints the print (multiply-ish) and adds a little light (screen-ish)
  col = mix(col, col * (0.75 + 0.6 * holo), amt * 1.4) + holo * amt * 0.35;

  // light sweep that rides the tilt
  float sx = vUv.x * 0.8 + vUv.y * 0.6 - v2.x * 1.4 - v2.y * 0.6;
  float band = exp(-pow(fract(sx * 0.5) - 0.5, 2.0) * 90.0);
  col += mix(vec3(1.0, 0.85, 0.6), hue(sx * 3.0 + 0.2), 0.6) * band * 0.12 * uFoil * (1.0 - 0.7 * ink);

  // glitter: tiny facets that flash when they line up with view + light
  vec2 cell = floor(vUv * vec2(170.0, 245.0));
  float r = hash(cell);
  vec3 facet = normalize(vec3((r - 0.5) * 0.9, (hash(cell + 3.1) - 0.5) * 0.9, 1.0));
  float tw = step(0.972, r) * pow(max(dot(facet, normalize(vec3(h, 1.0))), 0.0), 60.0);
  col += vec3(1.0, 0.92, 0.75) * tw * 1.8 * uFoil;

  // firelit edge from below + fresnel rim
  float flick = 0.78 + 0.22 * sin(uTime * 6.0 + vUv.x * 14.0) * sin(uTime * 2.3);
  col += uFireCol * smoothstep(0.42, 0.0, vUv.y) * flick * 0.2 * uFire;
  col += uFireCol * pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.28 * uFire;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const emberVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPixel;
varying float vAlpha;
void main() {
  vec3 p = position;
  float speed = 0.18 + aSeed * 0.35;
  p.y = mod(p.y + uTime * speed + 2.6, 5.2) - 2.6;
  p.x += sin(uTime * (0.6 + aSeed) + aSeed * 40.0) * 0.18;
  p.z += cos(uTime * 0.5 + aSeed * 20.0) * 0.1;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.0 + aSeed * 5.0) * uPixel * (3.0 / -mv.z);
  float life = smoothstep(-2.6, -1.6, p.y) * (1.0 - smoothstep(1.2, 2.6, p.y));
  vAlpha = life * (0.35 + 0.65 * fract(aSeed * 13.7)) * (0.6 + 0.4 * sin(uTime * 4.0 + aSeed * 30.0));
}
`;

export const emberFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * (1.0 + a), a * vAlpha);
}
`;
