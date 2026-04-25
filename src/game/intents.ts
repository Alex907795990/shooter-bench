import type { MovementInputData } from "./data";

export interface MovePlayerIntent {
  type: "move-player";
  playerId: string;
  input: MovementInputData;
}

export interface ApplyDamageIntent {
  type: "apply-damage";
  sourceId: string;
  targetKind: "player" | "enemy";
  targetId: string;
  amount: number;
}

export type BattleIntent = MovePlayerIntent | ApplyDamageIntent;
