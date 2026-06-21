import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  OPEN_WORLD_CONFIG,
  getBoundaryWalls,
  getObstacleSpecs,
} from './worldConfig.js';

function findAnimation(animations, keyword) {
  return animations.find((clip) =>
    clip.name.toLowerCase().includes(keyword.toLowerCase()),
  );
}

function createBox({ name, position, size, color, kind }) {
  const geometry = new THREE.BoxGeometry(...size);
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (kind) mesh.userData.kind = kind;
  return mesh;
}

function createGround() {
  const geometry = new THREE.PlaneGeometry(
    OPEN_WORLD_CONFIG.groundSize,
    OPEN_WORLD_CONFIG.groundSize,
  );
  const material = new THREE.MeshLambertMaterial({ color: 0x90a955 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'open-world-ground';
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function createPlayerAnchor({ onPlayerReady } = {}) {
  const anchor = new THREE.Group();
  anchor.name = 'player-anchor';
  anchor.position.set(0, 0, 8);

  const fallbackGeometry = new THREE.CapsuleGeometry(0.35, 1.1, 6, 12);
  const fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0x304ffe });
  const fallback = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
  fallback.name = 'player-fallback';
  fallback.position.y = 0.9;
  fallback.castShadow = true;
  anchor.add(fallback);

  if (typeof window === 'undefined') {
    return anchor;
  }

  const loader = new GLTFLoader();
  loader.load(
    OPEN_WORLD_CONFIG.playerModelUrl,
    (gltf) => {
      fallback.visible = false;
      const model = gltf.scene;
      model.name = 'player-model';
      model.scale.setScalar(0.8);
      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      anchor.add(model);
      const mixer = new THREE.AnimationMixer(model);
      const idleClip = findAnimation(gltf.animations, 'idle') || gltf.animations[0];
      const walkClip = findAnimation(gltf.animations, 'walk') || gltf.animations[1];
      const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
      const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
      let activeAction = idleAction;
      idleAction?.play();
      onPlayerReady?.({
        update(delta, moving) {
          const nextAction = moving ? walkAction : idleAction;
          if (nextAction && nextAction !== activeAction) {
            activeAction?.fadeOut(0.15);
            nextAction.reset().fadeIn(0.15).play();
            activeAction = nextAction;
          }
          mixer.update(delta);
        },
      });
    },
    undefined,
    () => {
      fallback.visible = true;
    },
  );

  return anchor;
}

export function createOpenWorldGroup(options = {}) {
  const group = new THREE.Group();
  group.name = 'open-world-root';

  group.add(createGround());

  getBoundaryWalls().forEach((wall) => {
    group.add(
      createBox({
        ...wall,
        color: 0xd4c5a9,
      }),
    );
  });

  getObstacleSpecs().forEach((obstacle) => {
    group.add(
      createBox({
        ...obstacle,
        kind: 'starter-obstacle',
      }),
    );
  });

  group.add(createPlayerAnchor(options));
  return group;
}
