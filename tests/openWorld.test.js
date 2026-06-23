import { describe, expect, it } from 'vitest';
import { caseLoaders } from '../src/route.js';
import {
  OPEN_WORLD_CONFIG,
  getBoundaryWalls,
  getObstacleSpecs,
} from '../src/Case/OpenWorld/worldConfig.js';
import { createOpenWorldGroup } from '../src/Case/OpenWorld/mesh.js';

describe('open world route', () => {
  it('registers the OpenWorld case loader', () => {
    expect(caseLoaders.openworld).toEqual(expect.any(Function));
  });
});

describe('open world configuration', () => {
  it('uses a 100x100 ground plane with four boundary walls', () => {
    expect(OPEN_WORLD_CONFIG.groundSize).toBe(100);
    expect(getBoundaryWalls()).toHaveLength(4);
  });

  it('defines enough starter obstacles to make the scene inspectable', () => {
    expect(getObstacleSpecs()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'red-block' }),
        expect.objectContaining({ name: 'low-platform' }),
      ]),
    );
    expect(getObstacleSpecs().length).toBeGreaterThanOrEqual(5);
  });

  it('creates the starter world meshes with a player anchor', () => {
    const group = createOpenWorldGroup();
    expect(group.getObjectByName('open-world-ground')).toBeTruthy();
    expect(group.getObjectByName('player-anchor')).toBeTruthy();
    expect(group.children.filter((child) => child.name.startsWith('wall-'))).toHaveLength(4);
    expect(
      group.children.filter((child) => child.userData.kind === 'starter-obstacle'),
    ).toHaveLength(getObstacleSpecs().length);
  });
});
