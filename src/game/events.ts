import type { Vector2Data } from "./data";

export interface PlayerMovedEvent {
  type: "player-moved";
  playerId: string;
  fromPosition: Vector2Data;
  toPosition: Vector2Data;
}

export interface CameraMovedEvent {
  type: "camera-moved";
  cameraId: string;
  targetId: string;
  position: Vector2Data;
}

export interface WeaponFiredEvent {
  type: "weapon-fired";
  weaponId: string;
  projectileId: string;
  targetEnemyId: string;
}

export interface EnemySpawnedEvent {
  type: "enemy-spawned";
  enemyId: string;
  position: Vector2Data;
}

export interface EnemySpawnTelegraphedEvent {
  type: "enemy-spawn-telegraphed";
  markerId: string;
  enemyKind: string;
  position: Vector2Data;
  delaySeconds: number;
}

export interface BattleRoundEndedEvent {
  type: "battle-round-ended";
  roundNumber: number;
}

export interface ProjectileHitEnemyEvent {
  type: "projectile-hit-enemy";
  projectileId: string;
  enemyId: string;
  position: Vector2Data;
}

export interface EnemyDamagedEvent {
  type: "enemy-damaged";
  enemyId: string;
  sourceId: string;
  damage: number;
  healthRemaining: number;
}

export interface EnemyDiedEvent {
  type: "enemy-died";
  enemyId: string;
  sourceId: string;
  position: Vector2Data;
}

export interface PlayerDamagedEvent {
  type: "player-damaged";
  playerId: string;
  sourceId: string;
  damage: number;
  healthRemaining: number;
}

export interface MaterialDroppedEvent {
  type: "material-dropped";
  dropId: string;
  position: Vector2Data;
  amount: number;
}

export interface MaterialPickedUpEvent {
  type: "material-picked-up";
  dropId: string;
  playerId: string;
  amount: number;
  totalMaterial: number;
}

export interface BattlePhaseChangedEvent {
  type: "battle-phase-changed";
  fromPhase: string;
  toPhase: string;
}

export type BattleEvent =
  | PlayerMovedEvent
  | CameraMovedEvent
  | WeaponFiredEvent
  | EnemySpawnedEvent
  | EnemySpawnTelegraphedEvent
  | BattleRoundEndedEvent
  | ProjectileHitEnemyEvent
  | EnemyDamagedEvent
  | EnemyDiedEvent
  | PlayerDamagedEvent
  | MaterialDroppedEvent
  | MaterialPickedUpEvent
  | BattlePhaseChangedEvent;
