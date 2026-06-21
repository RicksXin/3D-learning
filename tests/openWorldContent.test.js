import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createBirdsGroup, getNextBirdTarget } from '../src/Case/OpenWorld/birds.js';
import {
  createDialogueSession,
  PERSON_DIALOGUE,
} from '../src/Case/OpenWorld/dialogue.js';
import {
  createDancingMirrorHutGroup,
  isNearDancer,
} from '../src/Case/OpenWorld/dancingMirrorHut.js';
import { createPersonGroup, isNearPerson, PERSON_CONFIG } from '../src/Case/OpenWorld/person.js';

describe('open world NPC content', () => {
  it('creates an NPC and detects nearby players', () => {
    const person = createPersonGroup();
    const near = new THREE.Vector3(PERSON_CONFIG.position[0] + 1, 0, PERSON_CONFIG.position[2]);
    const far = new THREE.Vector3(40, 0, 40);

    expect(person.name).toBe('person-root');
    expect(isNearPerson(near)).toBe(true);
    expect(isNearPerson(far)).toBe(false);
  });

  it('advances dialogue lines and reports completion', () => {
    const session = createDialogueSession(PERSON_DIALOGUE);

    expect(session.current()).toEqual(PERSON_DIALOGUE[0]);
    expect(session.next()).toEqual(PERSON_DIALOGUE[1]);
    session.next();
    session.next();
    session.next();
    expect(session.isComplete()).toBe(true);
  });
});

describe('open world ambient content', () => {
  it('creates a mirror hut with a dancer anchor', () => {
    const hut = createDancingMirrorHutGroup();

    expect(hut.name).toBe('dancing-mirror-hut-root');
    expect(hut.getObjectByName('dancer-anchor')).toBeTruthy();
    expect(isNearDancer(new THREE.Vector3(20, 0, -20))).toBe(true);
  });

  it('creates birds and targets inside world bounds', () => {
    const birds = createBirdsGroup();
    const target = getNextBirdTarget();

    expect(birds.name).toBe('birds-root');
    expect(Math.abs(target.x)).toBeLessThanOrEqual(45);
    expect(target.y).toBeGreaterThanOrEqual(2);
    expect(target.y).toBeLessThanOrEqual(9);
    expect(Math.abs(target.z)).toBeLessThanOrEqual(45);
  });
});
