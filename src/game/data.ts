export interface Vector2Data {
  x: number;
  y: number;
}

export interface RectangleData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MovementInputData {
  x: number;
  y: number;
}

export interface HealthData {
  current: number;
  max: number;
}

export const PLAYER_ID = "player";

export interface RandomStateData {
  seed: number;
}

export type BattleRoundStatusData = "running" | "completed";

export type BattlePhaseData = "battle" | "wave-summary" | "shop";

export type EnemyKindData = "chaser" | "tank" | "runner";

export interface EnemyPrototypeData {
  kind: EnemyKindData;
  radius: number;
  healthMax: number;
  moveSpeed: number;
  contactDamage: number;
  contactDamageCooldownSeconds: number;
}

export type SpawnPositionRuleData =
  | {
      type: "random";
      margin: number;
    }
  | {
      type: "edge";
      padding: number;
    }
  | {
      type: "group";
      centerRule: Exclude<SpawnPositionRuleData, { type: "group" }>;
      radius: number;
    };

export interface WaveUnitData {
  enemyKind: EnemyKindData;
  minCount: number;
  maxCount: number;
  spawnChance: number;
}

export interface WaveGroupData {
  id: string;
  triggerAtSeconds: number;
  repeatCount: number;
  repeatIntervalSeconds: number;
  spawnDelaySeconds: number;
  batchDelaySeconds: number;
  positionRule: SpawnPositionRuleData;
  units: WaveUnitData[];
}

export interface BattleRoundDefinitionData {
  roundNumber: number;
  durationSeconds: number;
  waveGroups: WaveGroupData[];
}

export interface MaterialDropPrototypeData {
  amount: number;
  pickupRadius: number;
  attractRadius: number;
  attractSpeed: number;
}
