import * as THREE from 'three';
import { io } from 'socket.io-client';

export const DEFAULT_MULTIPLAYER_SERVER_URL = 'http://localhost:3001';

function normalizeNumber(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function normalizeRemotePlayerState(input = {}) {
  return {
    id: String(input.id || input.username || 'remote'),
    username: String(input.username || input.id || 'Remote'),
    position: {
      x: normalizeNumber(input.position?.x, 0),
      y: normalizeNumber(input.position?.y, 0),
      z: normalizeNumber(input.position?.z, 0),
    },
    rotationY: normalizeNumber(input.rotationY, 0),
  };
}

export function createRemotePlayerGroup(state) {
  const normalized = normalizeRemotePlayerState(state);
  const group = new THREE.Group();
  group.name = `remote-player-${normalized.id}`;
  group.userData.remotePlayerId = normalized.id;

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.28, 1.1, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.7 }),
  );
  body.name = 'remote-player-body';
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  if (typeof document !== 'undefined') {
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(15,23,42,0.82)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '26px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(normalized.username.slice(0, 16), 128, 32);
    const texture = new THREE.CanvasTexture(labelCanvas);
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true }),
    );
    label.name = 'remote-player-label';
    label.position.y = 2.2;
    label.scale.set(2.4, 0.6, 1);
    group.add(label);
  }

  updateRemotePlayerGroup(group, normalized);
  return group;
}

export function updateRemotePlayerGroup(group, state) {
  const normalized = normalizeRemotePlayerState(state);
  group.position.set(
    normalized.position.x,
    normalized.position.y,
    normalized.position.z,
  );
  group.rotation.y = normalized.rotationY;
  group.userData.remotePlayerState = normalized;
}

export function createMultiplayerClient({
  token,
  serverUrl = DEFAULT_MULTIPLAYER_SERVER_URL,
  socketFactory = io,
} = {}) {
  let socket = null;
  const remoteUpdateListeners = new Set();

  function ensureSocket() {
    if (socket) return socket;
    socket = socketFactory(serverUrl, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket'],
    });
    socket.on('remote:update', (state) => {
      const normalized = normalizeRemotePlayerState(state);
      remoteUpdateListeners.forEach((listener) => listener(normalized));
    });
    socket.on('players:snapshot', (states = []) => {
      states.map(normalizeRemotePlayerState).forEach((state) => {
        remoteUpdateListeners.forEach((listener) => listener(state));
      });
    });
    return socket;
  }

  return {
    connect() {
      ensureSocket().connect();
    },
    disconnect() {
      socket?.disconnect();
    },
    onRemoteUpdate(listener) {
      remoteUpdateListeners.add(listener);
      return () => remoteUpdateListeners.delete(listener);
    },
    sendPlayerState(state) {
      ensureSocket().emit('player:update', state);
    },
  };
}
