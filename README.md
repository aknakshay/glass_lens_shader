# glass_lens_shader

A one-file Flutter package that ships a **magnifying glass-lens** fragment
shader (`lens.frag`).

The shader draws a rounded-capsule "lens" that:

- **barrel-magnifies** the content sampled behind it (a `sampler2D` you supply),
- adds a **chromatic-aberration rim** (RGB channel split toward the edge),
- and paints a **translucent glass body** with a soft specular highlight.

It's packaged as a dependency rather than a project asset so it can be
delivered to **builder/CI environments that don't let you edit `pubspec.yaml`
directly** (e.g. FlutterFlow): a dependency package has its shaders compiled
and bundled automatically, accessible under `packages/glass_lens_shader/`,
with **no `shaders:` entry needed in the consuming app**.

## Install

As a git dependency (in your app's `pubspec.yaml`, or a builder's custom
dependency field):

```yaml
glass_lens_shader:
  git:
    url: https://github.com/<you>/glass_lens_shader.git
    ref: main          # or a tag/commit for a pinned version
```

## Use

```dart
import 'dart:ui' as ui;
import 'package:glass_lens_shader/glass_lens_shader.dart';

final program = await ui.FragmentProgram.fromAsset(kGlassLensShaderAsset);
final shader = program.fragmentShader();
// set the uniforms below, bind your texture, draw with a Paint()..shader = shader
```

## Uniforms

All scalar floats (set in this order via `setFloat`), plus one `sampler2D`
(`uTexture` — the content to magnify):

| idx | name | meaning |
|-----|------|---------|
| 0 | uResX | canvas logical width |
| 1 | uResY | canvas logical height |
| 2 | uCenterX | lens centre x (px) |
| 3 | uCenterY | lens centre y (px) |
| 4 | uHalfW | capsule half-width (px) |
| 5 | uHalfH | capsule half-height (px) |
| 6 | uRadius | capsule corner radius (px) |
| 7 | uMagnify | centre magnification (~1.12–1.22) |
| 8 | uAberration | rim RGB split (fraction of width) |
| 9 | uBloom | overall lens presence 0–1 |

The shader expects the sampled texture to be **premultiplied** (as
`toImageSync()` produces) and un-premultiplies internally, so glyph/edge alpha
composites correctly.

## License

MIT
