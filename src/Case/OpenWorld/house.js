import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const HOUSE_CONFIG = {
  origin: [-20, 0, -20],
  roomWidth: 8,
  roomDepth: 7,
  wallHeight: 3,
  wallThickness: 0.25,
  computerPosition: [-20, 1.35, -22.7],
};

function createBox(name, position, size, color, kind) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshPhongMaterial({ color }),
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (kind) mesh.userData.kind = kind;
  return mesh;
}

function loadModel(anchor, url, scale) {
  if (typeof window === 'undefined') return;
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;
    model.scale.setScalar(scale);
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    anchor.add(model);
  });
}

function createComputerAnchor() {
  const anchor = new THREE.Group();
  anchor.name = 'computer-anchor';
  anchor.position.set(...HOUSE_CONFIG.computerPosition);

  const desk = createBox('computer-desk-fallback', [0, -0.55, 0.2], [2.4, 0.12, 1.1], 0x7a5230);
  const monitor = createBox('computer-monitor-fallback', [0, 0.15, 0], [1.35, 0.75, 0.08], 0x1f2937);
  const screen = createBox('computer-screen-fallback', [0, 0.15, 0.05], [1.15, 0.55, 0.03], 0x111827);
  anchor.add(desk, monitor, screen);

  loadModel(anchor, './desk.glb', 0.8);
  loadModel(anchor, './monitor.glb', 0.9);

  return anchor;
}

export function createHouseGroup() {
  const group = new THREE.Group();
  group.name = 'house-root';

  const [x, y, z] = HOUSE_CONFIG.origin;
  const halfWidth = HOUSE_CONFIG.roomWidth / 2;
  const halfDepth = HOUSE_CONFIG.roomDepth / 2;
  const wallY = y + HOUSE_CONFIG.wallHeight / 2;

  group.add(
    createBox(
      'house-wall-front',
      [x, wallY, z + halfDepth],
      [HOUSE_CONFIG.roomWidth, HOUSE_CONFIG.wallHeight, HOUSE_CONFIG.wallThickness],
      0xd4c5a9,
      'house-wall',
    ),
  );
  group.add(
    createBox(
      'house-wall-back',
      [x, wallY, z - halfDepth],
      [HOUSE_CONFIG.roomWidth, HOUSE_CONFIG.wallHeight, HOUSE_CONFIG.wallThickness],
      0xd4c5a9,
      'house-wall',
    ),
  );
  group.add(
    createBox(
      'house-wall-left',
      [x - halfWidth, wallY, z],
      [HOUSE_CONFIG.wallThickness, HOUSE_CONFIG.wallHeight, HOUSE_CONFIG.roomDepth],
      0xd4c5a9,
      'house-wall',
    ),
  );
  group.add(
    createBox(
      'house-wall-right',
      [x + halfWidth, wallY, z],
      [HOUSE_CONFIG.wallThickness, HOUSE_CONFIG.wallHeight, HOUSE_CONFIG.roomDepth],
      0xd4c5a9,
      'house-wall',
    ),
  );

  const roof = createBox(
    'house-roof',
    [x, y + HOUSE_CONFIG.wallHeight + 0.15, z],
    [HOUSE_CONFIG.roomWidth + 0.5, 0.3, HOUSE_CONFIG.roomDepth + 0.5],
    0x8b5e34,
  );
  group.add(roof);

  const door = createBox(
    'house-door',
    [x - 1.2, y + 1, z + halfDepth + 0.15],
    [1.1, 2, 0.12],
    0x6b4423,
  );
  door.rotation.y = -0.45;
  group.add(door);

  group.add(createComputerAnchor());
  return group;
}
