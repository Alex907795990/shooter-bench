import type { Vector2Type } from "../type/vector2.type";

export type PlayerStateType = {
  position: Vector2Type;
  speed: number;
};

export const createPlayerState = (
  startX: number,
  startY: number,
  speed: number,
): PlayerStateType => ({
  position: { x: startX, y: startY },
  speed,
});
