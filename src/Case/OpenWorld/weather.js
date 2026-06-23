import * as THREE from 'three';

export const WEATHER_PRESETS = {
  sunny: {
    name: 'sunny',
    label: '晴天',
    background: 0x87ceeb,
    fog: null,
    particleCount: 0,
  },
  rain: {
    name: 'rain',
    label: '雨天',
    background: 0x64748b,
    fog: { color: 0x64748b, near: 18, far: 78 },
    particleCount: 650,
    particleColor: 0x93c5fd,
    particleSize: 0.06,
    velocityY: -16,
  },
  snow: {
    name: 'snow',
    label: '雪天',
    background: 0xcbd5e1,
    fog: { color: 0xcbd5e1, near: 16, far: 70 },
    particleCount: 520,
    particleColor: 0xffffff,
    particleSize: 0.12,
    velocityY: -4,
  },
  fog: {
    name: 'fog',
    label: '雾天',
    background: 0xb6c2d2,
    fog: { color: 0xb6c2d2, near: 5, far: 45 },
    particleCount: 0,
  },
};

export function getWeatherPreset(name) {
  return WEATHER_PRESETS[name] || WEATHER_PRESETS.sunny;
}

export function getNextWeatherName(name) {
  const names = Object.keys(WEATHER_PRESETS);
  const index = names.indexOf(name);
  return names[(index + 1 + names.length) % names.length];
}

export function createWeatherParticlePositions(count, spread = 90, random = Math.random) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const offset = i * 3;
    positions[offset] = (random() - 0.5) * spread;
    positions[offset + 1] = 6 + random() * 12;
    positions[offset + 2] = (random() - 0.5) * spread;
  }
  return positions;
}

export function createWeatherGroup() {
  const group = new THREE.Group();
  group.name = 'weather-root';

  Object.values(WEATHER_PRESETS).forEach((preset) => {
    if (!preset.particleCount) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(createWeatherParticlePositions(preset.particleCount), 3),
    );
    const material = new THREE.PointsMaterial({
      color: preset.particleColor,
      size: preset.particleSize,
      transparent: true,
      opacity: preset.name === 'rain' ? 0.68 : 0.9,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.name = `${preset.name}-particles`;
    points.visible = false;
    points.userData.weatherName = preset.name;
    points.userData.velocityY = preset.velocityY;
    group.add(points);
  });

  return group;
}

export function applyWeatherToScene(scene, weatherGroup, weatherName) {
  const preset = getWeatherPreset(weatherName);
  scene.background = new THREE.Color(preset.background);
  scene.fog = preset.fog
    ? new THREE.Fog(preset.fog.color, preset.fog.near, preset.fog.far)
    : null;

  if (weatherGroup) {
    weatherGroup.children.forEach((child) => {
      child.visible = child.userData.weatherName === preset.name;
    });
  }

  return preset.name;
}

export function updateWeatherGroup(weatherGroup, delta) {
  weatherGroup.children.forEach((child) => {
    if (!child.visible) return;
    const position = child.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i += 1) {
      const y = position.getY(i) + child.userData.velocityY * delta;
      position.setY(i, y < 0 ? 18 : y);
    }
    position.needsUpdate = true;
  });
}
