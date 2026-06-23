import { describe, expect, it } from 'vitest';
import { getBoundaryWalls, getObstacleSpecs } from '../src/Case/OpenWorld/worldConfig.js';
import { createStarterPhysics } from '../src/Case/OpenWorld/physics.js';
import { getMovementIntent } from '../src/Case/OpenWorld/playerControls.js';

describe('open world physics', () => {
  it('creates static bodies for ground, walls, obstacles, plus the player body', () => {
    const physics = createStarterPhysics();
    const expectedStaticBodies = 1 + getBoundaryWalls().length + getObstacleSpecs().length;

    expect(physics.world.bodies).toHaveLength(expectedStaticBodies + 1);
    expect(physics.staticBodies).toHaveLength(expectedStaticBodies);
    expect(physics.playerBody.mass).toBe(1);
    expect(physics.playerBody.position.y).toBeGreaterThan(0);
  });
});

describe('open world player movement intent', () => {
  it('normalizes diagonal movement so the player is not faster diagonally', () => {
    const intent = getMovementIntent({ KeyW: true, KeyD: true });

    expect(intent.length()).toBeCloseTo(1);
    expect(intent.x).toBeGreaterThan(0);
    expect(intent.z).toBeLessThan(0);
  });

  it('returns a zero vector when no movement keys are pressed', () => {
    expect(getMovementIntent({}).length()).toBe(0);
  });
});
