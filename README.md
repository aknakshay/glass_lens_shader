# rivendell_lens_shader

A one-file Flutter package that ships the **navigation-bar lens** fragment
shader (`rivendell_lens.frag`) for the Rivendell app.

It exists so the shader can be delivered to the FlutterFlow-managed app as a
**dependency**, rather than as a project asset — FlutterFlow does not emit a
`shaders:` block in its generated `pubspec.yaml` for a shader loaded from
custom code, so a normal asset upload never gets compiled/bundled by the
FlutterFlow CI build. A dependency package, by contrast, has its shaders
compiled and bundled automatically.

## Use in FlutterFlow

1. Push this folder to a git repository (e.g. GitHub).
2. In FlutterFlow → **Custom Code → Pubspec Dependencies**, add:

   ```yaml
   rivendell_lens_shader:
     git:
       url: https://github.com/<you>/rivendell_lens_shader.git
       ref: main          # or a tag/commit for a pinned version
   ```

3. Load the shader in custom code with the `packages/` prefix:

   ```dart
   ui.FragmentProgram.fromAsset(
     'packages/rivendell_lens_shader/shaders/rivendell_lens.frag',
   );
   ```

No `shaders:` entry is needed in the app's own `pubspec.yaml`.

## Uniforms

All scalar floats (set in this order via `setFloat`), plus one `sampler2D`
(`uTexture`, the icon-row snapshot):

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
