import * as CANNON from 'cannon-es';
import {
  OPEN_WORLD_CONFIG,
  getBoundaryWalls,
  getObstacleSpecs,
} from './worldConfig.js';

function createBoxBody({ position, size, mass = 0, name }) {
  const body = new CANNON.Body({ mass });
  body.name = name;
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2),
    ),
  );
  body.position.set(...position);
  return body;
}

function createPlayerBody() {
  const body = new CANNON.Body({
    mass: 1,
    fixedRotation: true,
    linearDamping: 0.08,
    angularDamping: 1,
  });
  body.name = 'player-body';
  body.addShape(
    new CANNON.Box(
      new CANNON.Vec3(
        OPEN_WORLD_CONFIG.playerRadius,
        OPEN_WORLD_CONFIG.playerHeight / 2,
        OPEN_WORLD_CONFIG.playerRadius,
      ),
    ),
  );
  body.position.set(0, OPEN_WORLD_CONFIG.playerHeight / 2, 8);
  return body;
}

export function createStarterPhysics() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });
  world.allowSleep = true;

  const staticBodies = [];

  const groundBody = createBoxBody({
    name: 'ground-body',
    position: [0, -0.1, 0],
    size: [OPEN_WORLD_CONFIG.groundSize, 0.2, OPEN_WORLD_CONFIG.groundSize],
  });
  staticBodies.push(groundBody);

  getBoundaryWalls().forEach((wall) => {
    staticBodies.push(
      createBoxBody({
        name: `${wall.name}-body`,
        position: wall.position,
        size: wall.size,
      }),
    );
  });

  getObstacleSpecs().forEach((obstacle) => {
    staticBodies.push(
      createBoxBody({
        name: `${obstacle.name}-body`,
        position: obstacle.position,
        size: obstacle.size,
      }),
    );
  });

  staticBodies.forEach((body) => world.addBody(body));

  const playerBody = createPlayerBody();
  world.addBody(playerBody);

  return {
    world,
    staticBodies,
    playerBody,
    playerGroundY: OPEN_WORLD_CONFIG.playerHeight / 2,
  };
}
