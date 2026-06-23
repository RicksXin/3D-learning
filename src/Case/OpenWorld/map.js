import { OPEN_WORLD_CONFIG } from './worldConfig.js';

export const MAP_MARKERS = [
  { name: 'Spawn', type: 'player', position: { x: 0, z: 0 }, color: '#ffffff' },
  { name: 'House', type: 'building', position: { x: -18, z: 16 }, color: '#f59e0b' },
  { name: 'Computer', type: 'tool', position: { x: -20, z: 15 }, color: '#38bdf8' },
  { name: 'Car', type: 'vehicle', position: { x: 3, z: 4 }, color: '#ef4444' },
  { name: 'Plane', type: 'vehicle', position: { x: -12, z: 10 }, color: '#a855f7' },
  { name: 'Person', type: 'npc', position: { x: 12, z: -12 }, color: '#22c55e' },
  { name: 'Dancer', type: 'npc', position: { x: 20, z: -20 }, color: '#ec4899' },
];

export function worldToMapPoint(position, mapSize, worldSize = OPEN_WORLD_CONFIG.groundSize) {
  const half = worldSize / 2;
  const clamp = (value) => Math.max(0, Math.min(mapSize, value));

  return {
    x: Math.round(clamp(((position.x + half) / worldSize) * mapSize)),
    y: Math.round(clamp(((position.z + half) / worldSize) * mapSize)),
  };
}

export function drawMap(ctx, options) {
  const {
    size,
    player,
    vehicleMode = 'player',
    markers = MAP_MARKERS,
  } = options;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const line = (size / 4) * i;
    ctx.beginPath();
    ctx.moveTo(line, 0);
    ctx.lineTo(line, size);
    ctx.moveTo(0, line);
    ctx.lineTo(size, line);
    ctx.stroke();
  }

  markers.forEach((marker) => {
    const point = worldToMapPoint(marker.position, size);
    ctx.fillStyle = marker.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  if (player) {
    const point = worldToMapPoint(player, size);
    ctx.fillStyle = vehicleMode === 'player' ? '#ffffff' : '#fde68a';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
