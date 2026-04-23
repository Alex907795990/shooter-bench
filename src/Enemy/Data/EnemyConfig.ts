export interface EnemyConfig {
  readonly initialSpawnMargin: number;
  readonly defaultSpeed: number;
  readonly initialIdStart: number;
  readonly batchIntervalMs: number;
  readonly batchSize: number;
  readonly spawnDelayMs: number;
  readonly minDistanceFromPlayer: number;
  readonly maxConcurrent: number;
}

export const ENEMY_CONFIG: EnemyConfig = {
  initialSpawnMargin: 200,
  defaultSpeed: 90,
  initialIdStart: 100,
  batchIntervalMs: 1500,
  batchSize: 3,
  spawnDelayMs: 1000,
  minDistanceFromPlayer: 180,
  maxConcurrent: 100,
};
