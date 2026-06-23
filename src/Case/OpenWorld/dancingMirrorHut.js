import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

export const DANCING_HUT_CONFIG = {
  position: [20, 0, -20],
  range: 3,
};

function createMirror(name, position, rotationY) {
  const geometry = new THREE.PlaneGeometry(5, 2.5);
  let mirror;
  if (typeof window === 'undefined') {
    mirror = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({ color: 0x9ca3af, side: THREE.DoubleSide }),
    );
  } else {
    mirror = new Reflector(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      color: 0x889999,
    });
  }
  mirror.name = name;
  mirror.position.set(...position);
  mirror.rotation.y = rotationY;
  return mirror;
}

function createDancerAnchor() {
  const anchor = new THREE.Group();
  anchor.name = 'dancer-anchor';
  anchor.position.set(
    DANCING_HUT_CONFIG.position[0],
    DANCING_HUT_CONFIG.position[1],
    DANCING_HUT_CONFIG.position[2],
  );
  const fallback = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 1, 6, 12),
    new THREE.MeshPhongMaterial({ color: 0xec4899 }),
  );
  fallback.position.y = 0.9;
  anchor.add(fallback);

  if (typeof window !== 'undefined') {
    new GLTFLoader().load('./Michelle.glb', (gltf) => {
      anchor.clear();
      const model = gltf.scene;
      model.name = 'dancer-model';
      model.scale.setScalar(0.9);
      anchor.add(model);
    });
  }
  return anchor;
}

export function createDancingMirrorHutGroup() {
  const group = new THREE.Group();
  group.name = 'dancing-mirror-hut-root';
  const [x, y, z] = DANCING_HUT_CONFIG.position;
  group.add(createMirror('mirror-back', [x, y + 1.4, z - 2.6], 0));
  group.add(createMirror('mirror-front', [x, y + 1.4, z + 2.6], Math.PI));
  group.add(createMirror('mirror-left', [x - 2.6, y + 1.4, z], Math.PI / 2));
  group.add(createMirror('mirror-right', [x + 2.6, y + 1.4, z], -Math.PI / 2));
  group.add(createDancerAnchor());
  return group;
}

export function isNearDancer(position) {
  const target = new THREE.Vector3(...DANCING_HUT_CONFIG.position);
  return target.distanceTo(position) <= DANCING_HUT_CONFIG.range;
}
