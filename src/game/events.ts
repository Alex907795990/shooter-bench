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

export type BattleEvent = PlayerMovedEvent | CameraMovedEvent;
