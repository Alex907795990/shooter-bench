import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface EnemyMovedEvent {
  type: "enemyMoved";
  id: number;
  pos: Vec2;
}

export interface EnemyDiedEvent {
  type: "enemyDied";
  id: number;
}

export interface EnemySpawnCooldownTickedEvent {
  type: "enemySpawnCooldownTicked";
  cooldownMs: number;
}

export interface EnemySpawnMarkerCreatedEvent {
  type: "enemySpawnMarkerCreated";
  id: number;
  pos: Vec2;
  remainMs: number;
}

export interface EnemySpawnMarkerTickedEvent {
  type: "enemySpawnMarkerTicked";
  id: number;
  remainMs: number;
}

export interface EnemySpawnMarkerExpiredEvent {
  type: "enemySpawnMarkerExpired";
  id: number;
}

export interface EnemySpawnedEvent {
  type: "enemySpawned";
  enemyId: number;
  pos: Vec2;
  speed: number;
}

export type EnemyEvent =
  | EnemyMovedEvent
  | EnemyDiedEvent
  | EnemySpawnCooldownTickedEvent
  | EnemySpawnMarkerCreatedEvent
  | EnemySpawnMarkerTickedEvent
  | EnemySpawnMarkerExpiredEvent
  | EnemySpawnedEvent;
