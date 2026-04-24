import type { MovementInputData } from "./data";

export interface MovePlayerIntent {
  type: "move-player";
  playerId: string;
  input: MovementInputData;
}

export type BattleIntent = MovePlayerIntent;
