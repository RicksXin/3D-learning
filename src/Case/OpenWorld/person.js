import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const PERSON_CONFIG = {
  position: [5, 0, 5],
  range: 3,
};

function createFallbackPerson() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 1, 6, 12),
    new THREE.MeshPhongMaterial({ color: 0x8b5cf6 }),
  );
  body.position.y = 0.9;
  group.add(body);
  return group;
}

export function createPersonGroup() {
  const group = new THREE.Group();
  group.name = 'person-root';
  group.position.set(...PERSON_CONFIG.position);
  group.add(createFallbackPerson());

  if (typeof window !== 'undefined') {
    new GLTFLoader().load('./person.glb', (gltf) => {
      group.clear();
      const model = gltf.scene;
      model.name = 'person-model';
      model.scale.setScalar(0.8);
      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      group.add(model);
    });
  }

  return group;
}

export function isNearPerson(position) {
  const target = new THREE.Vector3(...PERSON_CONFIG.position);
  return target.distanceTo(position) <= PERSON_CONFIG.range;
}
