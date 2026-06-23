import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BOUNDS = 45;
const MIN_Y = 2;
const MAX_Y = 9;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

export function getNextBirdTarget() {
  return new THREE.Vector3(
    randomInRange(-BOUNDS, BOUNDS),
    randomInRange(MIN_Y, MAX_Y),
    randomInRange(-BOUNDS, BOUNDS),
  );
}

function createFallbackBirds() {
  const group = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const bird = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.5, 3),
      new THREE.MeshPhongMaterial({ color: 0x111827 }),
    );
    bird.position.set(i * 0.5, Math.sin(i) * 0.2, i * -0.3);
    bird.rotation.x = Math.PI / 2;
    group.add(bird);
  }
  return group;
}

export function createBirdsGroup() {
  const group = new THREE.Group();
  group.name = 'birds-root';
  group.position.set(0, 6, -12);
  group.userData.target = getNextBirdTarget();
  group.add(createFallbackBirds());

  if (typeof window !== 'undefined') {
    new GLTFLoader().load('./birds.glb', (gltf) => {
      group.clear();
      const model = gltf.scene;
      model.name = 'birds-model';
      model.scale.setScalar(0.8);
      group.add(model);
    });
  }

  return group;
}

export function updateBirds(group, delta) {
  if (!group) return;
  const target = group.userData.target || getNextBirdTarget();
  group.userData.target = target;
  const toTarget = target.clone().sub(group.position);
  if (toTarget.length() < 1) {
    group.userData.target = getNextBirdTarget();
    return;
  }
  toTarget.normalize();
  group.position.addScaledVector(toTarget, delta * 3);
  group.lookAt(group.position.clone().add(toTarget));
}
