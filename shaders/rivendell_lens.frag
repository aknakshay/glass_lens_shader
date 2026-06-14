#version 460 core
#include <flutter/runtime_effect.glsl>

precision highp float;

// Uniforms are all scalar floats (no vec2) so the shader is accepted by
// FlutterFlow's shader widget, which exposes each float as a slider — that
// widget is what makes FlutterFlow bundle this .frag (emit the pubspec
// `shaders:` entry) on a FlutterFlow CI build. Declaration order == the
// setFloat() index in _LensPainter; a vec2 would occupy two slots, so the
// flattened float layout (0..9) is identical to the previous vec2 version.
uniform float uResX;         // 0  canvas logical width  (== icon-row rect)
uniform float uResY;         // 1  canvas logical height
uniform float uCenterX;      // 2  lens centre x, logical px in canvas space
uniform float uCenterY;      // 3  lens centre y
uniform float uHalfW;        // 4  capsule half-extent w/2, logical px
uniform float uHalfH;        // 5  capsule half-extent h/2, logical px
uniform float uRadius;       // 6  capsule corner radius, logical px
uniform float uMagnify;      // 7  centre magnification, e.g. 1.12..1.22
uniform float uAberration;   // 8  rim RGB split, fraction of width (~0.012)
uniform float uBloom;        // 9  overall lens presence 0..1
uniform sampler2D uTexture;  // sampler 0  icon-row snapshot

out vec4 fragColor;

// signed distance to a rounded box centred at origin, half-size b, radius r
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  // Reassemble the vec2s the body uses from the scalar uniforms above.
  vec2 uResolution = vec2(uResX, uResY);
  vec2 uLensCenter = vec2(uCenterX, uCenterY);
  vec2 uHalf = vec2(uHalfW, uHalfH);

  vec2 frag = FlutterFragCoord().xy;
  vec2 rel = frag - uLensCenter;          // px from lens centre
  float d = sdRoundedBox(rel, uHalf, uRadius);

  // Outside the capsule: fully transparent so the crisp icons underneath show.
  if (d > 0.5) {
    fragColor = vec4(0.0);
    return;
  }

  float minHalf = max(min(uHalf.x, uHalf.y), 1.0);
  // rim: 0 at centre -> ~1 at the capsule edge
  float rim = clamp(1.0 + d / minHalf, 0.0, 1.0);

  // Barrel magnification: strong at centre, eased to 1 at the rim.
  float mag = mix(uMagnify, 1.0, rim * rim);
  vec2 sampleXY = uLensCenter + rel / mag;     // logical px
  vec2 uv = sampleXY / uResolution;            // normalised [0,1]

  // Radial direction for the chromatic split (guard the centre).
  vec2 dir = rel / max(length(rel), 1.0);
  float ab = uAberration * rim * uBloom;       // grows toward the rim
  vec2 off = dir * ab;

  vec4 cr = texture(uTexture, uv + off);
  vec4 cg = texture(uTexture, uv);
  vec4 cb = texture(uTexture, uv - off);

  // Only count icon pixels that actually fall inside the icon-row image; the
  // bulge above/below the bar samples out of range -> show glass body only.
  float inside =
      step(0.0, uv.x) * step(uv.x, 1.0) *
      step(0.0, uv.y) * step(uv.y, 1.0);

  // toImageSync() pixels are PREMULTIPLIED, so un-premultiply each chromatic
  // sample by its own alpha to recover straight RGB. The final
  // `fragColor = vec4(col * a, a)` then premultiplies exactly once; without
  // this the icons' anti-aliased edges darken into a halo under the lens.
  vec3 icon = vec3(
    cr.a > 0.001 ? cr.r / cr.a : 0.0,
    cg.a > 0.001 ? cg.g / cg.a : 0.0,
    cb.a > 0.001 ? cb.b / cb.a : 0.0
  ) * inside;
  float iconA = cg.a * inside;

  // Translucent glass body + a brighter specular along the top rim.
  float body = 0.10 * uBloom;
  float spec = smoothstep(0.55, 1.0, rim) * clamp(-rel.y / uHalf.y, 0.0, 1.0);
  vec3 col = icon + vec3(body) + spec * 0.22 * uBloom;

  // Resulting alpha: icon coverage OR the glass body, faded by a soft edge.
  float edge = clamp((0.0 - d), 0.0, 1.5) / 1.5;   // 1 inside -> 0 at the AA rim
  float a = max(iconA, body) * edge;
  // Keep a gentle resting presence even when bloom is low.
  a *= clamp(uBloom + 0.35, 0.0, 1.0);

  // Flutter expects premultiplied-alpha output.
  fragColor = vec4(col * a, a);
}
