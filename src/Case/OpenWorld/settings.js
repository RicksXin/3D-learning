export const DEFAULT_OPEN_WORLD_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  showMiniMap: true,
  cameraSensitivity: 0.002,
};

export function normalizeOpenWorldSettings(input = {}) {
  const cameraSensitivity = Number(input.cameraSensitivity);

  return {
    soundEnabled:
      typeof input.soundEnabled === 'boolean'
        ? input.soundEnabled
        : DEFAULT_OPEN_WORLD_SETTINGS.soundEnabled,
    showMiniMap:
      typeof input.showMiniMap === 'boolean'
        ? input.showMiniMap
        : DEFAULT_OPEN_WORLD_SETTINGS.showMiniMap,
    musicEnabled:
      typeof input.musicEnabled === 'boolean'
        ? input.musicEnabled
        : DEFAULT_OPEN_WORLD_SETTINGS.musicEnabled,
    cameraSensitivity: Number.isFinite(cameraSensitivity)
      ? Math.max(0.0005, Math.min(0.006, cameraSensitivity))
      : DEFAULT_OPEN_WORLD_SETTINGS.cameraSensitivity,
  };
}
