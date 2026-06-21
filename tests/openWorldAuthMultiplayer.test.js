import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  loadAuthSession,
  loginUser,
  logoutUser,
  OPEN_WORLD_AUTH_KEY,
  registerUser,
} from '../src/Case/OpenWorld/auth.js';
import {
  createMultiplayerClient,
  createRemotePlayerGroup,
  normalizeRemotePlayerState,
} from '../src/Case/OpenWorld/multiplayer.js';

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

function createFakeSocketFactory(record) {
  return (url, options) => {
    record.url = url;
    record.options = options;
    return {
      connected: false,
      handlers: {},
      connect() {
        this.connected = true;
      },
      disconnect() {
        this.connected = false;
      },
      emit(event, payload) {
        record.emitted.push({ event, payload });
      },
      on(event, handler) {
        this.handlers[event] = handler;
      },
    };
  };
}

describe('open world auth', () => {
  it('registers users, logs in, and stores a jwt-like session', () => {
    const storage = createMemoryStorage();
    const session = registerUser(storage, {
      username: 'player-one',
      password: 'secret1',
    });

    expect(session.username).toBe('player-one');
    expect(session.token.split('.')).toHaveLength(3);
    expect(loadAuthSession(storage)).toEqual(session);
    expect(storage.getItem(OPEN_WORLD_AUTH_KEY)).toContain('player-one');
  });

  it('rejects invalid login and clears sessions on logout', () => {
    const storage = createMemoryStorage();
    registerUser(storage, { username: 'player-two', password: 'secret2' });

    expect(() => loginUser(storage, { username: 'player-two', password: 'badpass' })).toThrow();
    logoutUser(storage);
    expect(loadAuthSession(storage)).toBeNull();
  });
});

describe('open world multiplayer', () => {
  it('normalizes remote player state and creates a renderable group', () => {
    const state = normalizeRemotePlayerState({
      id: 'remote-1',
      username: 'friend',
      position: { x: 2, y: 0, z: -3 },
    });
    const group = createRemotePlayerGroup(state);

    expect(state.position).toEqual({ x: 2, y: 0, z: -3 });
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.name).toBe('remote-player-remote-1');
  });

  it('creates a socket.io client with jwt auth and emits player updates', () => {
    const record = { emitted: [] };
    const client = createMultiplayerClient({
      token: 'jwt-token',
      socketFactory: createFakeSocketFactory(record),
    });

    client.connect();
    client.sendPlayerState({ position: { x: 1, y: 2, z: 3 } });

    expect(record.options.auth.token).toBe('jwt-token');
    expect(record.emitted[0]).toEqual({
      event: 'player:update',
      payload: { position: { x: 1, y: 2, z: 3 } },
    });
  });
});
