import { normalizeOpenWorldSettings } from './settings.js';
import { getWeatherPreset } from './weather.js';

export const OPEN_WORLD_SAVE_KEY = 'open-world-progress-v1';

const DEFAULT_POSITION = { x: 0, y: 0.9, z: 0 };

function normalizeNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function normalizePosition(position, fallback = DEFAULT_POSITION) {
  return {
    x: normalizeNumber(position?.x, fallback.x),
    y: normalizeNumber(position?.y, fallback.y),
    z: normalizeNumber(position?.z, fallback.z),
  };
}

export function normalizeOpenWorldSave(input = {}) {
  const vehicleModes = new Set(['player', 'car', 'plane']);

  return {
    version: 1,
    player: normalizePosition(input.player),
    car: normalizePosition(input.car, { x: 3, y: 0.8, z: 4 }),
    plane: normalizePosition(input.plane, { x: -12, y: 1, z: 10 }),
    vehicleMode: vehicleModes.has(input.vehicleMode) ? input.vehicleMode : 'player',
    weather: getWeatherPreset(input.weather).name,
    settings: normalizeOpenWorldSettings(input.settings),
  };
}

export function saveOpenWorldState(storage, state) {
  const normalized = normalizeOpenWorldSave(state);
  storage.setItem(OPEN_WORLD_SAVE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadOpenWorldState(storage) {
  const raw = storage.getItem(OPEN_WORLD_SAVE_KEY);
  if (!raw) return null;

  try {
    return normalizeOpenWorldSave(JSON.parse(raw));
  } catch {
    return null;
  }
}
