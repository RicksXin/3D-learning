import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { HOUSE_CONFIG } from './house.js';

const COMPUTER_RANGE = 3;

export function isNearComputer(position) {
  const computer = new THREE.Vector3(...HOUSE_CONFIG.computerPosition);
  return computer.distanceTo(position) <= COMPUTER_RANGE;
}

export function createComputerScreenObject() {
  if (typeof document === 'undefined') return null;

  const panel = document.createElement('div');
  panel.className = 'open-world-computer-screen';
  panel.innerHTML = `
    <div class="open-world-computer-bar">Open World Terminal</div>
    <div class="open-world-computer-body">
      <div>status: online</div>
      <div>world: local sandbox</div>
      <div>press E to exit</div>
    </div>
  `;

  const object = new CSS3DObject(panel);
  object.name = 'computer-css3d-screen';
  object.position.set(...HOUSE_CONFIG.computerPosition);
  object.position.z += 0.08;
  object.scale.setScalar(0.006);
  return object;
}

export function enterComputerView({ camera, playerAnchor }) {
  const target = new THREE.Vector3(...HOUSE_CONFIG.computerPosition);
  if (playerAnchor) playerAnchor.visible = false;
  camera.position.set(target.x, target.y + 0.25, target.z + 1.25);
  camera.lookAt(target);
}

export function exitComputerView({ playerAnchor }) {
  if (playerAnchor) playerAnchor.visible = true;
}
