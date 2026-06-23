import * as THREE from 'three';

export const PLAYER_CONTROL_KEYS = {
  forward: ['KeyW', 'ArrowUp'],
  backward: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
};

function isPressed(keys, codes) {
  return codes.some((code) => keys[code]);
}

export function getMovementIntent(keys) {
  const intent = new THREE.Vector3();

  if (isPressed(keys, PLAYER_CONTROL_KEYS.forward)) intent.z -= 1;
  if (isPressed(keys, PLAYER_CONTROL_KEYS.backward)) intent.z += 1;
  if (isPressed(keys, PLAYER_CONTROL_KEYS.left)) intent.x -= 1;
  if (isPressed(keys, PLAYER_CONTROL_KEYS.right)) intent.x += 1;

  if (intent.lengthSq() > 0) {
    intent.normalize();
  }

  return intent;
}

export function rotateIntentByYaw(intent, yaw) {
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);

  return new THREE.Vector3(
    intent.x * cos - intent.z * sin,
    0,
    intent.x * sin + intent.z * cos,
  );
}
