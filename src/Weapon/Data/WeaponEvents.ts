import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface WeaponCooldownTickedEvent {
  type: "weaponCooldownTicked";
  weaponId: number;
  cooldownMs: number;
}

export interface WeaponMovedEvent {
  type: "weaponMoved";
  weaponId: number;
  pos: Vec2;
}

export interface ProjectileSpawnedEvent {
  type: "projectileSpawned";
  weaponId: number;
  id: number;
  pos: Vec2;
  vel: Vec2;
  ttlMs: number;
  hitRadius: number;
  cooldownAfterMs: number;
}

export interface ProjectileMovedEvent {
  type: "projectileMoved";
  id: number;
  pos: Vec2;
  ttlMs: number;
}

export interface ProjectileExpiredEvent {
  type: "projectileExpired";
  id: number;
}

export interface ProjectileHitEnemyEvent {
  type: "projectileHitEnemy";
  projectileId: number;
  enemyId: number;
}

export type WeaponEvent =
  | WeaponCooldownTickedEvent
  | WeaponMovedEvent
  | ProjectileSpawnedEvent
  | ProjectileMovedEvent
  | ProjectileExpiredEvent
  | ProjectileHitEnemyEvent;
