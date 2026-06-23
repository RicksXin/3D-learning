import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const CAR_CONFIG = {
  position: [0, 0.65, 10],
  size: [2, 1.3, 5],
  speed: 9,
  turnSpeed: 1.9,
  range: 3,
};

function createFallbackCar() {
  const group = new THREE.Group();
  group.name = 'car-fallback';
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 3.4),
    new THREE.MeshPhongMaterial({ color: 0x2f80ed }),
  );
  body.position.y = 0.45;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.7, 1.2),
    new THREE.MeshPhongMaterial({ color: 0x1f2937 }),
  );
  cabin.position.set(0, 1.1, -0.2);
  group.add(body, cabin);
  return group;
}

export function createCarGroup() {
  const group = new THREE.Group();
  group.name = 'car-root';
  group.position.set(...CAR_CONFIG.position);
  group.add(createFallbackCar());

  if (typeof window !== 'undefined') {
    new GLTFLoader().load('./car.glb', (gltf) => {
      group.clear();
      const model = gltf.scene;
      model.name = 'car-model';
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

export function createCarBody() {
  const body = new CANNON.Body({
    mass: 1,
    fixedRotation: true,
    linearDamping: 0.2,
  });
  body.name = 'car-body';
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(
        CAR_CONFIG.size[0] / 2,
        CAR_CONFIG.size[1] / 2,
        CAR_CONFIG.size[2] / 2,
      ),
    ),
  );
  body.position.set(...CAR_CONFIG.position);
  body.userData = { yaw: 0 };
  return body;
}

export function isNearCar(position, carPosition) {
  const target = new THREE.Vector3(carPosition.x, carPosition.y, carPosition.z);
  return target.distanceTo(position) <= CAR_CONFIG.range;
}

export function updateCarPhysics(body, keys, delta) {
  const forward = keys.KeyW ? 1 : 0;
  const backward = keys.KeyS ? -1 : 0;
  const drive = forward + backward;
  const turn = (keys.KeyA ? 1 : 0) + (keys.KeyD ? -1 : 0);

  if (drive !== 0) {
    body.userData.yaw += turn * CAR_CONFIG.turnSpeed * drive * delta;
  }

  const yaw = body.userData.yaw;
  body.position.x += Math.sin(yaw) * CAR_CONFIG.speed * drive * delta;
  body.position.z -= Math.cos(yaw) * CAR_CONFIG.speed * drive * delta;
  body.position.y = CAR_CONFIG.position[1];
  body.quaternion.setFromEuler(0, yaw, 0);
}

export function syncCarGroup(group, body) {
  group.position.copy(body.position);
  group.quaternion.copy(body.quaternion);
}
