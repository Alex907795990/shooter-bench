import type { HealthData, RandomStateData, RectangleData, Vector2Data } from "./data";

export interface PlayerInstance {
  id: string;
  position: Vector2Data;
  radius: number;
  moveSpeed: number;
  health: HealthData;
  hitFlashSeconds: number;
}

export interface CameraInstance {
  id: string;
  targetId: string;
  position: Vector2Data;
}

export interface WeaponInstance {
  id: string;
  ownerId: string;
  slotIndex: number;
  position: Vector2Data;
  facingRadians: number;
  fireIntervalSeconds: number;
  cooldownSeconds: number;
  attackRange: number;
  projectileSpeed: number;
  projectileRadius: number;
  projectileDamage: number;
}

export interface ProjectileInstance {
  id: string;
  ownerWeaponId: string;
  position: Vector2Data;
  velocity: Vector2Data;
  radius: number;
  damage: number;
}

export interface EnemyInstance {
  id: string;
  position: Vector2Data;
  radius: number;
  health: HealthData;
  moveSpeed: number;
  contactDamage: number;
  contactDamageCooldownSeconds: number;
  contactDamageElapsedSeconds: number;
  hitFlashSeconds: number;
}

export interface EnemySpawnerInstance {
  id: string;
  spawnIntervalSeconds: number;
  elapsedSeconds: number;
}

export interface InstanceContainer {
  worldBounds: RectangleData;
  randomState: RandomStateData;
  players: Map<string, PlayerInstance>;
  cameras: Map<string, CameraInstance>;
  weapons: Map<string, WeaponInstance>;
  projectiles: Map<string, ProjectileInstance>;
  enemies: Map<string, EnemyInstance>;
  enemySpawners: Map<string, EnemySpawnerInstance>;
  nextProjectileIndex: number;
  nextEnemyIndex: number;
}

export function createBattleInstanceContainer(): InstanceContainer {
  return {
    worldBounds: {
      x: 0,
      y: 0,
      width: 1600,
      height: 1200,
    },
    randomState: {
      seed: 93827,
    },
    players: new Map([
      [
        "player",
        {
          id: "player",
          position: { x: 800, y: 600 },
          radius: 24,
          moveSpeed: 310,
          health: { current: 10, max: 10 },
          hitFlashSeconds: 0,
        },
      ],
    ]),
    cameras: new Map([
      [
        "main",
        {
          id: "main",
          targetId: "player",
          position: { x: 800, y: 600 },
        },
      ],
    ]),
    weapons: new Map([
      [
        "weapon-left",
        {
          id: "weapon-left",
          ownerId: "player",
          slotIndex: 0,
          position: { x: 760, y: 600 },
          facingRadians: 0,
          fireIntervalSeconds: 0.55,
          cooldownSeconds: 0.15,
          attackRange: 430,
          projectileSpeed: 640,
          projectileRadius: 7,
          projectileDamage: 1,
        },
      ],
      [
        "weapon-right",
        {
          id: "weapon-right",
          ownerId: "player",
          slotIndex: 1,
          position: { x: 840, y: 600 },
          facingRadians: 0,
          fireIntervalSeconds: 0.85,
          cooldownSeconds: 0.4,
          attackRange: 520,
          projectileSpeed: 520,
          projectileRadius: 9,
          projectileDamage: 1,
        },
      ],
    ]),
    projectiles: new Map(),
    enemies: new Map(),
    enemySpawners: new Map([
      [
        "battle-enemy-spawner",
        {
          id: "battle-enemy-spawner",
          spawnIntervalSeconds: 1.1,
          elapsedSeconds: 0,
        },
      ],
    ]),
    nextProjectileIndex: 1,
    nextEnemyIndex: 1,
  };
}
