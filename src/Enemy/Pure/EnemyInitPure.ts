import type { EnemyState } from "../Data/EnemyState";
import { ENEMY_CONFIG } from "../Data/EnemyConfig";

export function createEnemyInitialStatePure(
  arenaWidth: number,
  arenaHeight: number,
): EnemyState {
  const m = ENEMY_CONFIG.initialSpawnMargin;
  const s = ENEMY_CONFIG.defaultSpeed;
  return {
    list: [
      { id: 1, pos: { x: m, y: m }, speed: s },
      { id: 2, pos: { x: arenaWidth - m, y: m }, speed: s },
      { id: 3, pos: { x: m, y: arenaHeight - m }, speed: s },
      { id: 4, pos: { x: arenaWidth - m, y: arenaHeight - m }, speed: s },
    ],
    nextId: ENEMY_CONFIG.initialIdStart,
    spawnCooldownMs: ENEMY_CONFIG.batchIntervalMs,
    pendingSpawns: [],
    nextMarkerId: 1,
  };
}
