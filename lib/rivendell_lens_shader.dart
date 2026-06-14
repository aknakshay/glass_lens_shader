/// Asset key for the navigation-bar lens fragment shader bundled by this
/// package. Pass it to `ui.FragmentProgram.fromAsset`:
///
/// ```dart
/// final program = await ui.FragmentProgram.fromAsset(kRivendellLensShaderAsset);
/// ```
library rivendell_lens_shader;

/// The `packages/`-prefixed asset path Flutter assigns to this package's
/// bundled shader. Stable across builds, so the consuming app can rely on it.
const String kRivendellLensShaderAsset =
    'packages/rivendell_lens_shader/shaders/rivendell_lens.frag';
