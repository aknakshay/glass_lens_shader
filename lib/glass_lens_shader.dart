/// A magnifying glass-lens fragment shader, bundled for use via
/// `ui.FragmentProgram.fromAsset`:
///
/// ```dart
/// final program = await ui.FragmentProgram.fromAsset(kGlassLensShaderAsset);
/// ```
library glass_lens_shader;

/// The `packages/`-prefixed asset path Flutter assigns to this package's
/// bundled shader. Stable across builds, so the consuming app can rely on it.
const String kGlassLensShaderAsset =
    'packages/glass_lens_shader/shaders/lens.frag';
