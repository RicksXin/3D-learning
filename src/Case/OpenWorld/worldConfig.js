export const OPEN_WORLD_CONFIG = {
  groundSize: 100,
  wallHeight: 4,
  wallThickness: 0.5,
  playerHeight: 1.8,
  playerRadius: 0.32,
  playerModelUrl: './Soldier.glb',
};

export function getBoundaryWalls() {
  const { groundSize, wallHeight, wallThickness } = OPEN_WORLD_CONFIG;
  const half = groundSize / 2;
  const y = wallHeight / 2;

  return [
    {
      name: 'wall-front',
      position: [0, y, half],
      size: [groundSize, wallHeight, wallThickness],
    },
    {
      name: 'wall-back',
      position: [0, y, -half],
      size: [groundSize, wallHeight, wallThickness],
    },
    {
      name: 'wall-left',
      position: [-half, y, 0],
      size: [wallThickness, wallHeight, groundSize],
    },
    {
      name: 'wall-right',
      position: [half, y, 0],
      size: [wallThickness, wallHeight, groundSize],
    },
  ];
}

export function getObstacleSpecs() {
  return [
    {
      name: 'red-block',
      position: [5, 1, 0],
      size: [2, 2, 2],
      color: 0xff6b6b,
    },
    {
      name: 'cyan-block',
      position: [-5, 1.5, -5],
      size: [3, 3, 3],
      color: 0x4ecdc4,
    },
    {
      name: 'low-platform',
      position: [0, 0.5, -10],
      size: [4, 1, 4],
      color: 0xffe66d,
    },
    {
      name: 'mint-block',
      position: [8, 1, -8],
      size: [2, 2, 2],
      color: 0x95e1d3,
    },
    {
      name: 'rose-tower',
      position: [-8, 1.5, -3],
      size: [2, 3, 2],
      color: 0xf38181,
    },
  ];
}
