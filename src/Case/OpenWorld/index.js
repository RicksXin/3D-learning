import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import {
  loadAuthSession,
  loginUser,
  logoutUser,
  registerUser,
} from './auth.js';
import {
  createCarBody,
  createCarGroup,
  isNearCar,
  syncCarGroup,
  updateCarPhysics,
} from './car.js';
import { createBirdsGroup, updateBirds } from './birds.js';
import { createComputerScreenObject, enterComputerView, exitComputerView, isNearComputer } from './computer.js';
import { createDialogueSession, DANCER_DIALOGUE, PERSON_DIALOGUE } from './dialogue.js';
import { createDancingMirrorHutGroup, isNearDancer } from './dancingMirrorHut.js';
import { createHouseGroup } from './house.js';
import { createLoadingTracker } from './loading.js';
import { CONTROL_MANUAL, getManualGroups } from './manual.js';
import { drawMap, MAP_MARKERS } from './map.js';
import { createOpenWorldGroup } from './mesh.js';
import {
  createMultiplayerClient,
  createRemotePlayerGroup,
  updateRemotePlayerGroup,
} from './multiplayer.js';
import { createPersonGroup, isNearPerson } from './person.js';
import { createStarterPhysics } from './physics.js';
import {
  createPlaneBody,
  createPlaneGroup,
  isNearPlane,
  PLANE_CONFIG,
  syncPlaneGroup,
  updatePlanePhysics,
} from './plane.js';
import { getMovementIntent, rotateIntentByYaw } from './playerControls.js';
import {
  loadOpenWorldState,
  saveOpenWorldState,
} from './save.js';
import {
  DEFAULT_OPEN_WORLD_SETTINGS,
  normalizeOpenWorldSettings,
} from './settings.js';
import {
  applyWeatherToScene,
  createWeatherGroup,
  getWeatherPreset,
  WEATHER_PRESETS,
  updateWeatherGroup,
} from './weather.js';

export function mount(stage) {
  const container = stage || document.body;
  const rect = container.getBoundingClientRect();
  let width = rect.width || window.innerWidth;
  let height = rect.height || window.innerHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  let playerAnimation = null;
  const openWorldGroup = createOpenWorldGroup({
    onPlayerReady(controller) {
      playerAnimation = controller;
    },
  });
  scene.add(openWorldGroup);
  scene.add(createHouseGroup());
  scene.add(createPersonGroup());
  scene.add(createDancingMirrorHutGroup());
  const birdsGroup = createBirdsGroup();
  scene.add(birdsGroup);
  const weatherGroup = createWeatherGroup();
  scene.add(weatherGroup);
  const remotePlayersGroup = new THREE.Group();
  remotePlayersGroup.name = 'remote-players-root';
  scene.add(remotePlayersGroup);
  const playerAnchor = openWorldGroup.getObjectByName('player-anchor');
  const physics = createStarterPhysics();
  const carGroup = createCarGroup();
  const carBody = createCarBody();
  const planeGroup = createPlaneGroup();
  const planeBody = createPlaneBody();
  physics.world.addBody(carBody);
  physics.world.addBody(planeBody);
  scene.add(carGroup);
  scene.add(planeGroup);
  const computerScreenObject = createComputerScreenObject();
  if (computerScreenObject) scene.add(computerScreenObject);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.name = 'open-world-sun';
  sun.position.set(20, 30, 10);
  sun.castShadow = true;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200);
  camera.position.set(0, 2.6, 14);
  camera.lookAt(0, 1, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.append(renderer.domElement);

  const css3Renderer = new CSS3DRenderer();
  css3Renderer.setSize(width, height);
  css3Renderer.domElement.style.position = 'absolute';
  css3Renderer.domElement.style.inset = '0';
  css3Renderer.domElement.style.pointerEvents = 'none';
  container.append(css3Renderer.domElement);

  const tipEl = document.createElement('div');
  tipEl.className = 'open-world-tip';
  container.append(tipEl);
  const dialogueEl = document.createElement('div');
  dialogueEl.className = 'open-world-dialogue';
  container.append(dialogueEl);

  let settings = normalizeOpenWorldSettings(DEFAULT_OPEN_WORLD_SETTINGS);
  const loadingTracker = createLoadingTracker([
    'scene',
    'physics',
    'assets',
    'interface',
    'first-frame',
  ]);
  const loadingEl = document.createElement('div');
  loadingEl.className = 'open-world-loading';
  loadingEl.innerHTML = `
    <div class="open-world-loading__title">加载开放世界</div>
    <div class="open-world-loading__bar"><span></span></div>
    <div class="open-world-loading__percent">0%</div>
  `;
  container.append(loadingEl);
  const loadingFillEl = loadingEl.querySelector('.open-world-loading__bar span');
  const loadingPercentEl = loadingEl.querySelector('.open-world-loading__percent');
  let loadingHideTimer = 0;

  function updateLoading(step) {
    const percent = loadingTracker.complete(step);
    loadingFillEl.style.width = `${percent}%`;
    loadingPercentEl.textContent = `${percent}%`;
    if (loadingTracker.isComplete() && !loadingHideTimer) {
      loadingHideTimer = window.setTimeout(() => {
        loadingEl.classList.add('is-hidden');
      }, 450);
    }
  }

  const manualGroups = getManualGroups();
  const uiRoot = document.createElement('div');
  uiRoot.className = 'open-world-ui';
  uiRoot.innerHTML = `
    <div class="open-world-toolbar" aria-label="Open world tools">
      <button type="button" data-open-world-toggle="settings" title="Settings">S</button>
      <button type="button" data-open-world-toggle="manual" title="Manual">?</button>
      <button type="button" data-open-world-toggle="map" title="Map">M</button>
      <button type="button" data-open-world-toggle="auth" title="Account">A</button>
    </div>
    <section class="open-world-panel open-world-settings-panel" data-open-world-panel="settings" hidden>
      <h2>设置</h2>
      <label>
        <input type="checkbox" data-open-world-setting="soundEnabled" checked>
        音效
      </label>
      <label>
        <input type="checkbox" data-open-world-setting="musicEnabled" checked>
        背景音乐
      </label>
      <label>
        <input type="checkbox" data-open-world-setting="showMiniMap" checked>
        小地图
      </label>
      <label>
        视角灵敏度
        <input type="range" min="0.0005" max="0.006" step="0.0005" data-open-world-setting="cameraSensitivity" value="0.002">
      </label>
      <div class="open-world-weather-controls">
        <span>天气</span>
        ${Object.values(WEATHER_PRESETS)
          .map(
            (preset) =>
              `<button type="button" data-open-world-weather="${preset.name}">${preset.label}</button>`,
          )
          .join('')}
      </div>
      <div class="open-world-save-controls">
        <button type="button" data-open-world-action="save">保存</button>
        <button type="button" data-open-world-action="load">读取</button>
      </div>
      <p class="open-world-save-status" aria-live="polite"></p>
    </section>
    <section class="open-world-panel open-world-manual-panel" data-open-world-panel="manual" hidden>
      <h2>使用手册</h2>
      ${manualGroups
        .map(
          (group) => `
            <div class="open-world-manual-group">
              <h3>${group.name}</h3>
              <dl>
                ${group.items
                  .map((item) => `<div><dt>${item.key}</dt><dd>${item.action}</dd></div>`)
                  .join('')}
              </dl>
            </div>
          `,
        )
        .join('')}
    </section>
    <section class="open-world-panel open-world-map-panel" data-open-world-panel="map" hidden>
      <h2>地图</h2>
      <canvas class="open-world-full-map" width="420" height="420" aria-label="Full map"></canvas>
      <div class="open-world-map-legend">
        ${MAP_MARKERS.map(
          (marker) =>
            `<span><i style="background:${marker.color}"></i>${marker.name}</span>`,
        ).join('')}
      </div>
    </section>
    <section class="open-world-panel open-world-auth-panel" data-open-world-panel="auth" hidden>
      <h2>账号</h2>
      <label>
        用户名
        <input type="text" data-open-world-auth-field="username" autocomplete="username">
      </label>
      <label>
        密码
        <input type="password" data-open-world-auth-field="password" autocomplete="current-password">
      </label>
      <div class="open-world-auth-actions">
        <button type="button" data-open-world-auth="register">注册</button>
        <button type="button" data-open-world-auth="login">登录</button>
        <button type="button" data-open-world-auth="connect">同步</button>
        <button type="button" data-open-world-auth="logout">退出</button>
      </div>
      <p class="open-world-auth-status" aria-live="polite"></p>
    </section>
    <canvas class="open-world-mini-map" width="180" height="180" aria-label="Mini map"></canvas>
  `;
  container.append(uiRoot);
  const miniMapCanvas = uiRoot.querySelector('.open-world-mini-map');
  const fullMapCanvas = uiRoot.querySelector('.open-world-full-map');
  const panels = {
    settings: uiRoot.querySelector('[data-open-world-panel="settings"]'),
    manual: uiRoot.querySelector('[data-open-world-panel="manual"]'),
    map: uiRoot.querySelector('[data-open-world-panel="map"]'),
    auth: uiRoot.querySelector('[data-open-world-panel="auth"]'),
  };
  const settingControls = uiRoot.querySelectorAll('[data-open-world-setting]');
  const weatherButtons = uiRoot.querySelectorAll('[data-open-world-weather]');
  const saveStatusEl = uiRoot.querySelector('.open-world-save-status');
  const authUsernameInput = uiRoot.querySelector('[data-open-world-auth-field="username"]');
  const authPasswordInput = uiRoot.querySelector('[data-open-world-auth-field="password"]');
  const authStatusEl = uiRoot.querySelector('.open-world-auth-status');
  updateLoading('scene');
  updateLoading('physics');
  updateLoading('assets');
  updateLoading('interface');

  const keys = {};
  const clock = new THREE.Clock();
  const cameraOffset = new THREE.Vector3(0, 2.4, 6);
  const cameraTargetOffset = new THREE.Vector3(0, 1.2, 0);
  const walkSound = new Audio('./walk.mp3');
  const drivingSound = new Audio('./driving.mp3');
  const flyingSound = new Audio('./flying.mp3');
  const backgroundMusic = new Audio('./flying.mp3');
  walkSound.loop = true;
  drivingSound.loop = true;
  flyingSound.loop = true;
  backgroundMusic.loop = true;
  walkSound.volume = 0.35;
  drivingSound.volume = 0.3;
  flyingSound.volume = 0.4;
  backgroundMusic.volume = 0.12;
  let cameraYaw = 0;
  let cameraPitch = -0.2;
  let isComputerView = false;
  let vehicleMode = 'player';
  let weatherName = 'sunny';
  let authSession = null;
  let multiplayerClient = null;
  let unsubscribeRemoteUpdates = null;
  let multiplayerSendElapsed = 0;
  let activeDialogue = null;
  let dancerDialogueComplete = false;
  let isDancing = false;
  let isWalkSoundPlaying = false;
  let wasMoving = false;
  let firstFrameReady = false;
  const remotePlayers = new Map();

  function setPanelOpen(panelName, open) {
    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name === panelName ? !open : true;
    });
  }

  function togglePanel(panelName) {
    const panel = panels[panelName];
    if (!panel) return;
    setPanelOpen(panelName, panel.hidden);
  }

  function closePanels() {
    Object.values(panels).forEach((panel) => {
      panel.hidden = true;
    });
  }

  function syncSettingControls() {
    settingControls.forEach((control) => {
      const settingName = control.dataset.openWorldSetting;
      if (control.type === 'checkbox') {
        control.checked = Boolean(settings[settingName]);
      } else {
        control.value = String(settings[settingName]);
      }
    });
  }

  function syncWeatherButtons() {
    weatherButtons.forEach((button) => {
      const isActive = button.dataset.openWorldWeather === weatherName;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateBackgroundMusic() {
    if (settings.musicEnabled && backgroundMusic.paused) {
      backgroundMusic.play().catch(() => {});
    } else if (!settings.musicEnabled && !backgroundMusic.paused) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  }

  function applySettings() {
    walkSound.muted = !settings.soundEnabled;
    drivingSound.muted = !settings.soundEnabled;
    flyingSound.muted = !settings.soundEnabled;
    backgroundMusic.muted = !settings.musicEnabled;
    miniMapCanvas.hidden = !settings.showMiniMap;
    if (!settings.soundEnabled) {
      updateWalkSound(false);
      updateLoopingSound(drivingSound, false);
      updateLoopingSound(flyingSound, false);
    }
    updateBackgroundMusic();
    syncSettingControls();
  }

  function setWeather(nextWeatherName) {
    weatherName = applyWeatherToScene(scene, weatherGroup, nextWeatherName);
    syncWeatherButtons();
  }

  function updateSaveStatus(message) {
    saveStatusEl.textContent = message;
  }

  function updateAuthStatus(message) {
    authStatusEl.textContent = message;
  }

  function syncAuthPanel() {
    const loggedIn = Boolean(authSession);
    panels.auth.dataset.loggedIn = String(loggedIn);
    if (loggedIn) {
      authUsernameInput.value = authSession.username;
      authPasswordInput.value = '';
    }
  }

  function upsertRemotePlayer(state) {
    if (!state.id || state.id === authSession?.username) return;
    let group = remotePlayers.get(state.id);
    if (!group) {
      group = createRemotePlayerGroup(state);
      remotePlayers.set(state.id, group);
      remotePlayersGroup.add(group);
    } else {
      updateRemotePlayerGroup(group, state);
    }
  }

  function connectMultiplayer() {
    if (!authSession) {
      updateAuthStatus('请先登录');
      return;
    }
    unsubscribeRemoteUpdates?.();
    multiplayerClient?.disconnect();
    multiplayerClient = createMultiplayerClient({ token: authSession.token });
    unsubscribeRemoteUpdates = multiplayerClient.onRemoteUpdate(upsertRemotePlayer);
    multiplayerClient.connect();
    updateAuthStatus(`已登录 ${authSession.username}，同步已启动`);
  }

  function getLocalMultiplayerState() {
    const position = getCurrentMapPosition();
    if (!authSession || !position) return null;
    return {
      id: authSession.username,
      username: authSession.username,
      position: {
        x: position.x,
        y:
          vehicleMode === 'car'
            ? carBody.position.y
            : vehicleMode === 'plane'
              ? planeBody.position.y
              : physics.playerBody.position.y,
        z: position.z,
      },
      rotationY: vehicleMode === 'player' ? playerAnchor?.rotation.y || 0 : 0,
    };
  }

  function sendMultiplayerState(delta) {
    if (!multiplayerClient || !authSession) return;
    multiplayerSendElapsed += delta;
    if (multiplayerSendElapsed < 0.2) return;
    multiplayerSendElapsed = 0;
    const state = getLocalMultiplayerState();
    if (state) {
      multiplayerClient.sendPlayerState(state);
    }
  }

  function handleAuthAction(action) {
    try {
      if (action === 'register') {
        authSession = registerUser(window.localStorage, {
          username: authUsernameInput.value,
          password: authPasswordInput.value,
        });
        syncAuthPanel();
        connectMultiplayer();
      } else if (action === 'login') {
        authSession = loginUser(window.localStorage, {
          username: authUsernameInput.value,
          password: authPasswordInput.value,
        });
        syncAuthPanel();
        connectMultiplayer();
      } else if (action === 'connect') {
        connectMultiplayer();
      } else if (action === 'logout') {
        logoutUser(window.localStorage);
        authSession = null;
        unsubscribeRemoteUpdates?.();
        unsubscribeRemoteUpdates = null;
        multiplayerClient?.disconnect();
        multiplayerClient = null;
        syncAuthPanel();
        updateAuthStatus('已退出');
      }
    } catch (error) {
      updateAuthStatus(error.message);
    }
  }

  function getSaveState() {
    return {
      player: {
        x: physics.playerBody.position.x,
        y: physics.playerBody.position.y,
        z: physics.playerBody.position.z,
      },
      car: {
        x: carBody.position.x,
        y: carBody.position.y,
        z: carBody.position.z,
      },
      plane: {
        x: planeBody.position.x,
        y: planeBody.position.y,
        z: planeBody.position.z,
      },
      vehicleMode,
      weather: weatherName,
      settings,
    };
  }

  function applySaveState(saveState) {
    physics.playerBody.position.set(saveState.player.x, saveState.player.y, saveState.player.z);
    physics.playerBody.velocity.set(0, 0, 0);
    carBody.position.set(saveState.car.x, saveState.car.y, saveState.car.z);
    carBody.velocity.set(0, 0, 0);
    carBody.angularVelocity.set(0, 0, 0);
    planeBody.position.set(saveState.plane.x, saveState.plane.y, saveState.plane.z);
    planeBody.velocity.set(0, 0, 0);
    planeBody.angularVelocity.set(0, 0, 0);
    vehicleMode = saveState.vehicleMode;
    if (playerAnchor) {
      playerAnchor.visible = vehicleMode === 'player';
      playerAnchor.position.set(
        saveState.player.x,
        saveState.player.y - physics.playerGroundY,
        saveState.player.z,
      );
    }
    settings = normalizeOpenWorldSettings(saveState.settings);
    applySettings();
    setWeather(saveState.weather);
    syncCarGroup(carGroup, carBody);
    syncPlaneGroup(planeGroup, planeBody);
  }

  function getCurrentMapPosition() {
    if (vehicleMode === 'car') {
      return { x: carBody.position.x, z: carBody.position.z };
    }
    if (vehicleMode === 'plane') {
      return { x: planeBody.position.x, z: planeBody.position.z };
    }
    return playerAnchor ? { x: playerAnchor.position.x, z: playerAnchor.position.z } : null;
  }

  function renderMaps() {
    const position = getCurrentMapPosition();
    if (!position) return;
    if (settings.showMiniMap) {
      drawMap(miniMapCanvas.getContext('2d'), {
        size: miniMapCanvas.width,
        player: position,
        vehicleMode,
      });
    }
    if (!panels.map.hidden) {
      drawMap(fullMapCanvas.getContext('2d'), {
        size: fullMapCanvas.width,
        player: position,
        vehicleMode,
      });
    }
  }

  function handleUiToggle(event) {
    const authButton = event.target.closest('[data-open-world-auth]');
    if (authButton) {
      handleAuthAction(authButton.dataset.openWorldAuth);
      return;
    }
    const weatherButton = event.target.closest('[data-open-world-weather]');
    if (weatherButton) {
      setWeather(weatherButton.dataset.openWorldWeather);
      updateSaveStatus(`${getWeatherPreset(weatherName).label}已启用`);
      return;
    }
    const actionButton = event.target.closest('[data-open-world-action]');
    if (actionButton?.dataset.openWorldAction === 'save') {
      saveOpenWorldState(window.localStorage, getSaveState());
      updateSaveStatus('已保存当前进度');
      return;
    }
    if (actionButton?.dataset.openWorldAction === 'load') {
      const saveState = loadOpenWorldState(window.localStorage);
      if (saveState) {
        applySaveState(saveState);
        updateSaveStatus('已读取上次进度');
      } else {
        updateSaveStatus('没有可读取的进度');
      }
      return;
    }
    const button = event.target.closest('[data-open-world-toggle]');
    if (!button) return;
    togglePanel(button.dataset.openWorldToggle);
    renderMaps();
  }

  function handleSettingChange(event) {
    const control = event.target.closest('[data-open-world-setting]');
    if (!control) return;
    const settingName = control.dataset.openWorldSetting;
    const value = control.type === 'checkbox' ? control.checked : Number(control.value);
    settings = normalizeOpenWorldSettings({
      ...settings,
      [settingName]: value,
    });
    applySettings();
  }

  uiRoot.addEventListener('click', handleUiToggle);
  uiRoot.addEventListener('change', handleSettingChange);
  uiRoot.addEventListener('input', handleSettingChange);
  applySettings();
  setWeather(weatherName);
  authSession = loadAuthSession(window.localStorage);
  syncAuthPanel();
  if (authSession) {
    updateAuthStatus(`已登录 ${authSession.username}`);
  }

  function isGrounded() {
    return physics.playerBody.position.y <= physics.playerGroundY + 0.08;
  }

  function updateWalkSound(moving) {
    const shouldMoveSoundPlay = moving && settings.soundEnabled;
    if (shouldMoveSoundPlay && !isWalkSoundPlaying) {
      walkSound.play().catch(() => {});
      isWalkSoundPlaying = true;
    } else if (!shouldMoveSoundPlay && isWalkSoundPlaying) {
      walkSound.pause();
      walkSound.currentTime = 0;
      isWalkSoundPlaying = false;
    }
  }

  function updateLoopingSound(sound, shouldPlay) {
    const canPlay = shouldPlay && settings.soundEnabled;
    if (canPlay && sound.paused) {
      sound.play().catch(() => {});
    } else if (!canPlay && !sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  function updatePlayer(delta) {
    if (isComputerView || vehicleMode !== 'player') {
      physics.world.step(1 / 60, delta, 3);
      playerAnimation?.update(delta, false);
      updateWalkSound(false);
      return;
    }

    const intent = getMovementIntent(keys);
    const moving = intent.lengthSq() > 0;
    const direction = rotateIntentByYaw(intent, cameraYaw);
    const speed = 5.5;

    physics.playerBody.velocity.x = direction.x * speed;
    physics.playerBody.velocity.z = direction.z * speed;

    if (keys.Space && isGrounded()) {
      physics.playerBody.velocity.y = 5;
    }

    physics.world.step(1 / 60, delta, 3);

    if (playerAnchor) {
      playerAnchor.position.set(
        physics.playerBody.position.x,
        physics.playerBody.position.y - physics.playerGroundY,
        physics.playerBody.position.z,
      );
      if (moving) {
        playerAnchor.rotation.y = cameraYaw;
      } else if (isDancing) {
        playerAnchor.rotation.y += delta * 5;
      }
    }

    playerAnimation?.update(delta, moving);
    updateWalkSound(moving);
    wasMoving = moving;
  }

  function updateCamera() {
    if (!playerAnchor || isComputerView || vehicleMode !== 'player') return;
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      cameraYaw,
    );
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      cameraPitch,
    );
    const offset = cameraOffset.clone().applyQuaternion(pitchQuat).applyQuaternion(yawQuat);
    const target = playerAnchor.position.clone().add(cameraTargetOffset);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
  }

  function updateVehicleCamera(body, height = 2.5, distance = 7) {
    const yaw = body.userData.yaw || 0;
    const target = new THREE.Vector3(body.position.x, body.position.y + 0.9, body.position.z);
    const offset = new THREE.Vector3(
      -Math.sin(yaw) * distance,
      height,
      Math.cos(yaw) * distance,
    );
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
  }

  function placePlayerBeside(body) {
    if (!playerAnchor) return;
    const yaw = body.userData.yaw || 0;
    const side = new THREE.Vector3(Math.cos(yaw) * 2, 0, Math.sin(yaw) * 2);
    physics.playerBody.position.set(
      body.position.x + side.x,
      physics.playerGroundY,
      body.position.z + side.z,
    );
    physics.playerBody.velocity.set(0, 0, 0);
    playerAnchor.position.set(
      physics.playerBody.position.x,
      0,
      physics.playerBody.position.z,
    );
    playerAnchor.visible = true;
  }

  function updateVehicles(delta) {
    if (vehicleMode === 'car') {
      updateCarPhysics(carBody, keys, delta);
      updateVehicleCamera(carBody, 2.6, 7);
    } else if (vehicleMode === 'plane') {
      updatePlanePhysics(planeBody, keys, delta);
      updateVehicleCamera(planeBody, 3.2, 8);
    }
    syncCarGroup(carGroup, carBody);
    syncPlaneGroup(planeGroup, planeBody);
    updateLoopingSound(drivingSound, vehicleMode === 'car');
    updateLoopingSound(flyingSound, vehicleMode === 'plane');
  }

  function updateTip() {
    if (!playerAnchor) {
      tipEl.textContent = '';
      return;
    }
    if (isComputerView) {
      tipEl.textContent = '按 E 退出电脑';
    } else if (vehicleMode === 'car') {
      tipEl.textContent = '按 X 下车';
    } else if (vehicleMode === 'plane') {
      tipEl.textContent =
        planeBody.position.y > PLANE_CONFIG.minHeight + 1
          ? 'Shift 降落后按 C 下飞机'
          : '按 C 下飞机';
    } else if (isNearCar(playerAnchor.position, carBody.position)) {
      tipEl.textContent = '按 X 上车';
    } else if (isNearPlane(playerAnchor.position, planeBody.position)) {
      tipEl.textContent = '按 C 上飞机';
    } else if (isDancing) {
      tipEl.textContent = '按 L 结束跳舞';
    } else if (isNearPerson(playerAnchor.position)) {
      tipEl.textContent = activeDialogue ? '按 H 继续 / K 结束' : '按 H 对话';
    } else if (isNearDancer(playerAnchor.position)) {
      tipEl.textContent = dancerDialogueComplete ? '按 J 跳舞' : '按 H 对话';
    } else if (isNearComputer(playerAnchor.position)) {
      tipEl.textContent = '按 E 使用电脑';
    } else {
      tipEl.textContent = '';
    }
  }

  function updateDialogue() {
    if (!activeDialogue) {
      dialogueEl.textContent = '';
      return;
    }
    const line = activeDialogue.session.current();
    dialogueEl.innerHTML = `
      <div><strong>玩家：</strong>${line.player}</div>
      <div><strong>NPC：</strong>${line.npc}</div>
    `;
  }

  let rafId = 0;
  function render() {
    const delta = Math.min(clock.getDelta(), 0.05);
    updatePlayer(delta);
    updateVehicles(delta);
    updateBirds(birdsGroup, delta);
    updateWeatherGroup(weatherGroup, delta);
    sendMultiplayerState(delta);
    updateCamera();
    updateTip();
    updateDialogue();
    renderMaps();
    renderer.render(scene, camera);
    css3Renderer.render(scene, camera);
    if (!firstFrameReady) {
      firstFrameReady = true;
      updateLoading('first-frame');
    }
    rafId = requestAnimationFrame(render);
  }
  render();

  function onResize() {
    const nextRect = container.getBoundingClientRect();
    width = nextRect.width || window.innerWidth;
    height = nextRect.height || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    css3Renderer.setSize(width, height);
  }

  window.addEventListener('resize', onResize);

  function onKeyDown(event) {
    if (event.code === 'F1') {
      event.preventDefault();
      togglePanel('manual');
      return;
    }
    if (event.code === 'KeyM') {
      togglePanel('map');
      renderMaps();
      return;
    }
    if (event.code === 'Escape') {
      closePanels();
      activeDialogue = null;
      return;
    }
    if (event.code === 'KeyE') {
      if (vehicleMode !== 'player') return;
      if (isComputerView) {
        isComputerView = false;
        exitComputerView({ playerAnchor });
      } else if (playerAnchor && isNearComputer(playerAnchor.position)) {
        isComputerView = true;
        enterComputerView({ camera, playerAnchor });
      }
      return;
    }
    if (event.code === 'KeyH' && vehicleMode === 'player' && !isComputerView) {
      if (!activeDialogue && playerAnchor && isNearPerson(playerAnchor.position)) {
        activeDialogue = {
          type: 'person',
          session: createDialogueSession(PERSON_DIALOGUE),
        };
      } else if (!activeDialogue && playerAnchor && isNearDancer(playerAnchor.position)) {
        activeDialogue = {
          type: 'dancer',
          session: createDialogueSession(DANCER_DIALOGUE),
        };
      } else if (activeDialogue) {
        activeDialogue.session.next();
        if (activeDialogue.type === 'dancer' && activeDialogue.session.isComplete()) {
          dancerDialogueComplete = true;
        }
      }
      return;
    }
    if (event.code === 'KeyK') {
      activeDialogue = null;
      return;
    }
    if (
      event.code === 'KeyJ' &&
      dancerDialogueComplete &&
      playerAnchor &&
      isNearDancer(playerAnchor.position)
    ) {
      isDancing = true;
      return;
    }
    if (event.code === 'KeyL') {
      isDancing = false;
      return;
    }
    if (event.code === 'KeyX' && !isComputerView) {
      if (vehicleMode === 'car') {
        vehicleMode = 'player';
        placePlayerBeside(carBody);
      } else if (
        vehicleMode === 'player' &&
        playerAnchor &&
        isNearCar(playerAnchor.position, carBody.position)
      ) {
        vehicleMode = 'car';
        playerAnchor.visible = false;
      }
      return;
    }
    if (event.code === 'KeyC' && !isComputerView) {
      if (
        vehicleMode === 'plane' &&
        planeBody.position.y <= PLANE_CONFIG.minHeight + 1
      ) {
        vehicleMode = 'player';
        placePlayerBeside(planeBody);
      } else if (
        vehicleMode === 'player' &&
        playerAnchor &&
        isNearPlane(playerAnchor.position, planeBody.position)
      ) {
        vehicleMode = 'plane';
        playerAnchor.visible = false;
      }
      return;
    }
    keys[event.code] = true;
  }

  function onKeyUp(event) {
    keys[event.code] = false;
  }

  function onCanvasClick() {
    if (isComputerView) return;
    renderer.domElement.requestPointerLock?.();
  }

  function onMouseMove(event) {
    if (document.pointerLockElement !== renderer.domElement) return;
    const sensitivity = settings.cameraSensitivity;
    cameraYaw -= event.movementX * sensitivity;
    cameraPitch = THREE.MathUtils.clamp(
      cameraPitch - event.movementY * sensitivity,
      -0.75,
      0.35,
    );
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  document.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('click', onCanvasClick);

  return function cleanup() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('mousemove', onMouseMove);
    uiRoot.removeEventListener('click', handleUiToggle);
    uiRoot.removeEventListener('change', handleSettingChange);
    uiRoot.removeEventListener('input', handleSettingChange);
    renderer.domElement.removeEventListener('click', onCanvasClick);
    window.clearTimeout(loadingHideTimer);
    updateWalkSound(false);
    updateLoopingSound(drivingSound, false);
    updateLoopingSound(flyingSound, false);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    unsubscribeRemoteUpdates?.();
    multiplayerClient?.disconnect();
    renderer.dispose();
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    if (css3Renderer.domElement.parentNode) {
      css3Renderer.domElement.parentNode.removeChild(css3Renderer.domElement);
    }
    if (tipEl.parentNode) {
      tipEl.parentNode.removeChild(tipEl);
    }
    if (dialogueEl.parentNode) {
      dialogueEl.parentNode.removeChild(dialogueEl);
    }
    if (loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
    if (uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot);
    }
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((material) => material.dispose?.());
      } else {
        obj.material?.dispose?.();
      }
    });
  };
}
