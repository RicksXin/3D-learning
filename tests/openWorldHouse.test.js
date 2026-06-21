import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createHouseGroup, HOUSE_CONFIG } from '../src/Case/OpenWorld/house.js';
import { isNearComputer } from '../src/Case/OpenWorld/computer.js';

describe('open world house', () => {
  it('creates the starter house with a door and computer anchor', () => {
    const house = createHouseGroup();

    expect(house.name).toBe('house-root');
    expect(house.getObjectByName('house-door')).toBeTruthy();
    expect(house.getObjectByName('computer-anchor')).toBeTruthy();
    expect(
      house.children.filter((child) => child.userData.kind === 'house-wall'),
    ).toHaveLength(4);
  });
});

describe('open world computer proximity', () => {
  it('detects positions near the computer screen', () => {
    const near = new THREE.Vector3(
      HOUSE_CONFIG.computerPosition[0],
      0,
      HOUSE_CONFIG.computerPosition[2] + 1,
    );
    const far = new THREE.Vector3(30, 0, 30);

    expect(isNearComputer(near)).toBe(true);
    expect(isNearComputer(far)).toBe(false);
  });
});
