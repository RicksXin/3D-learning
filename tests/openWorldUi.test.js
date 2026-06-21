import { describe, expect, it } from 'vitest';
import { createLoadingTracker } from '../src/Case/OpenWorld/loading.js';
import { CONTROL_MANUAL, getManualGroups } from '../src/Case/OpenWorld/manual.js';
import { MAP_MARKERS, worldToMapPoint } from '../src/Case/OpenWorld/map.js';
import {
  DEFAULT_OPEN_WORLD_SETTINGS,
  normalizeOpenWorldSettings,
} from '../src/Case/OpenWorld/settings.js';

describe('open world UI helpers', () => {
  it('maps world positions into minimap canvas coordinates', () => {
    expect(worldToMapPoint({ x: -50, z: -50 }, 200)).toEqual({ x: 0, y: 0 });
    expect(worldToMapPoint({ x: 0, z: 0 }, 200)).toEqual({ x: 100, y: 100 });
    expect(worldToMapPoint({ x: 50, z: 50 }, 200)).toEqual({ x: 200, y: 200 });
  });

  it('keeps important landmarks available for map rendering', () => {
    const names = MAP_MARKERS.map((marker) => marker.name);

    expect(names).toContain('House');
    expect(names).toContain('Car');
    expect(names).toContain('Plane');
    expect(names).toContain('Dancer');
  });

  it('normalizes settings from partial or invalid input', () => {
    const settings = normalizeOpenWorldSettings({
      soundEnabled: false,
      showMiniMap: false,
      cameraSensitivity: 99,
    });

    expect(settings.soundEnabled).toBe(false);
    expect(settings.showMiniMap).toBe(false);
    expect(settings.cameraSensitivity).toBe(0.006);
    expect(normalizeOpenWorldSettings({})).toEqual(DEFAULT_OPEN_WORLD_SETTINGS);
  });

  it('groups manual entries by category', () => {
    const groups = getManualGroups();
    const groupNames = groups.map((group) => group.name);

    expect(CONTROL_MANUAL.length).toBeGreaterThan(8);
    expect(groupNames).toContain('Movement');
    expect(groupNames).toContain('Interaction');
    expect(groupNames).toContain('Interface');
  });

  it('tracks loading progress until every setup step completes', () => {
    const tracker = createLoadingTracker(['scene', 'assets', 'ui']);

    expect(tracker.percent()).toBe(0);
    tracker.complete('scene');
    expect(tracker.percent()).toBe(34);
    tracker.complete('assets');
    tracker.complete('ui');
    expect(tracker.percent()).toBe(100);
    expect(tracker.isComplete()).toBe(true);
  });
});
