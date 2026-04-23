import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface EnemyEntity {
  id: number;
  pos: Vec2;
  speed: number;
}

export interface PendingSpawn {
  id: number;
  pos: Vec2;
  remainMs: number;
}

export interface EnemyState {
  list: EnemyEntity[];
  nextId: number;
  spawnCooldownMs: number;
  pendingSpawns: PendingSpawn[];
  nextMarkerId: number;
}
