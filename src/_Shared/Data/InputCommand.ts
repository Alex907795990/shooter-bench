import type { Vec2 } from "./Vec2";

export interface MoveInputCommand {
  type: "moveInput";
  dir: Vec2;
}

export type InputCommand = MoveInputCommand;
