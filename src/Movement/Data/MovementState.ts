import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface PlayerState {
  pos: Vec2;
  speed: number;
}

export interface MovementState {
  player: PlayerState;
}
