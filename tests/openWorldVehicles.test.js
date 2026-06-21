import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  CAR_CONFIG,
  createCarBody,
  isNearCar,
  updateCarPhysics,
} from '../src/Case/OpenWorld/car.js';
import {
  PLANE_CONFIG,
  createPlaneBody,
  isNearPlane,
  updatePlanePhysics,
} from '../src/Case/OpenWorld/plane.js';

describe('open world car', () => {
  it('creates a controllable car body and detects nearby players', () => {
    const body = createCarBody();
    const near = new THREE.Vector3(CAR_CONFIG.position[0] + 1, 0, CAR_CONFIG.position[2]);
    const far = new THREE.Vector3(40, 0, 40);

    expect(body.mass).toBe(1);
    expect(isNearCar(near, body.position)).toBe(true);
    expect(isNearCar(far, body.position)).toBe(false);
  });

  it('moves forward when W is pressed', () => {
    const body = createCarBody();
    const before = body.position.z;

    updateCarPhysics(body, { KeyW: true }, 1);

    expect(body.position.z).toBeLessThan(before);
  });
});

describe('open world plane', () => {
  it('creates a controllable plane body and detects nearby players', () => {
    const body = createPlaneBody();
    const near = new THREE.Vector3(
      PLANE_CONFIG.position[0] + 1,
      0,
      PLANE_CONFIG.position[2],
    );
    const far = new THREE.Vector3(40, 0, 40);

    expect(body.mass).toBe(1);
    expect(isNearPlane(near, body.position)).toBe(true);
    expect(isNearPlane(far, body.position)).toBe(false);
  });

  it('can climb but never descends below its minimum flight height', () => {
    const body = createPlaneBody();

    updatePlanePhysics(body, { Space: true }, 1);
    expect(body.position.y).toBeGreaterThan(PLANE_CONFIG.minHeight);

    updatePlanePhysics(body, { ShiftLeft: true }, 10);
    expect(body.position.y).toBe(PLANE_CONFIG.minHeight);
  });
});
