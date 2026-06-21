import { describe, expect, it } from 'vitest';
import {
  createWeatherParticlePositions,
  getNextWeatherName,
  getWeatherPreset,
  WEATHER_PRESETS,
} from '../src/Case/OpenWorld/weather.js';
import {
  loadOpenWorldState,
  normalizeOpenWorldSave,
  OPEN_WORLD_SAVE_KEY,
  saveOpenWorldState,
} from '../src/Case/OpenWorld/save.js';

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

describe('open world weather', () => {
  it('exposes the required weather presets', () => {
    expect(Object.keys(WEATHER_PRESETS)).toEqual(['sunny', 'rain', 'snow', 'fog']);
    expect(getWeatherPreset('missing').name).toBe('sunny');
  });

  it('cycles weather names in order', () => {
    expect(getNextWeatherName('sunny')).toBe('rain');
    expect(getNextWeatherName('fog')).toBe('sunny');
  });

  it('creates particle positions with three coordinates per particle', () => {
    const positions = createWeatherParticlePositions(12, 100, () => 0.5);

    expect(positions).toBeInstanceOf(Float32Array);
    expect(positions.length).toBe(36);
    expect(Array.from(positions.slice(0, 3))).toEqual([0, 12, 0]);
  });
});

describe('open world save data', () => {
  it('normalizes partial save data', () => {
    const save = normalizeOpenWorldSave({
      player: { x: 4, y: 2, z: -3 },
      vehicleMode: 'plane',
      weather: 'snow',
    });

    expect(save.player).toEqual({ x: 4, y: 2, z: -3 });
    expect(save.vehicleMode).toBe('plane');
    expect(save.weather).toBe('snow');
    expect(save.settings.soundEnabled).toBe(true);
  });

  it('saves and loads state from a storage-compatible object', () => {
    const storage = createMemoryStorage();
    const state = normalizeOpenWorldSave({
      player: { x: 1, y: 0.9, z: 2 },
      car: { x: 3, y: 0.8, z: 4 },
      plane: { x: -10, y: 1.2, z: 7 },
      vehicleMode: 'car',
      weather: 'rain',
    });

    saveOpenWorldState(storage, state);

    expect(storage.getItem(OPEN_WORLD_SAVE_KEY)).toContain('"weather":"rain"');
    expect(loadOpenWorldState(storage)).toEqual(state);
  });

  it('returns null for broken save payloads', () => {
    const storage = createMemoryStorage();
    storage.setItem(OPEN_WORLD_SAVE_KEY, '{broken');

    expect(loadOpenWorldState(storage)).toBeNull();
  });
});
