import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const PLANE_CONFIG = {
  position: [-10, 1.15, 10],
  size: [2, 1, 3],
  speed: 10,
  turnSpeed: 1.6,
  climbSpeed: 4,
  minHeight: 1.15,
  range: 3,
};

function createFallbackPlane() {
  const group = new THREE.Group();
  group.name = 'plane-fallback';
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, 2.4),
    new THREE.MeshPhongMaterial({ color: 0xf59e0b }),
  );
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.08, 0.7),
    new THREE.MeshPhongMaterial({ color: 0xfbbf24 }),
  );
  group.add(body, wing);
  return group;
}

export function createPlaneGroup() {
  const group = new THREE.Group();
  group.name = 'plane-root';
  group.position.set(...PLANE_CONFIG.position);
  group.add(createFallbackPlane());

  if (typeof window !== 'undefined') {
    new GLTFLoader().load('./toy_plane.glb', (gltf) => {
      group.clear();
      const model = gltf.scene;
      model.name = 'plane-model';
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

export function createPlaneBody() {
  const body = new CANNON.Body({
    mass: 1,
    fixedRotation: true,
    linearDamping: 0.1,
  });
  body.name = 'plane-body';
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(
        PLANE_CONFIG.size[0] / 2,
        PLANE_CONFIG.size[1] / 2,
        PLANE_CONFIG.size[2] / 2,
      ),
    ),
  );
  body.position.set(...PLANE_CONFIG.position);
  body.userData = { yaw: 0 };
  return body;
}

export function isNearPlane(position, planePosition) {
  const target = new THREE.Vector3(planePosition.x, planePosition.y, planePosition.z);
  return target.distanceTo(position) <= PLANE_CONFIG.range;
}

export function updatePlanePhysics(body, keys, delta) {
  const forward = keys.KeyW ? 1 : 0;
  const backward = keys.KeyS ? -1 : 0;
  const drive = forward + backward;
  const turn = (keys.KeyA ? 1 : 0) + (keys.KeyD ? -1 : 0);
  const climb = keys.Space ? 1 : 0;
  const descend = keys.ShiftLeft || keys.ShiftRight ? -1 : 0;

  if (drive !== 0) {
    body.userData.yaw += turn * PLANE_CONFIG.turnSpeed * drive * delta;
  }

  const yaw = body.userData.yaw;
  body.position.x += Math.sin(yaw) * PLANE_CONFIG.speed * drive * delta;
  body.position.z -= Math.cos(yaw) * PLANE_CONFIG.speed * drive * delta;
  body.position.y += (climb + descend) * PLANE_CONFIG.climbSpeed * delta;
  body.position.y = Math.max(PLANE_CONFIG.minHeight, body.position.y);
  body.quaternion.setFromEuler(0, yaw, 0);
}

export function syncPlaneGroup(group, body) {
  group.position.copy(body.position);
  group.quaternion.copy(body.quaternion);
}
