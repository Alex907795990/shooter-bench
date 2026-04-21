import type { PlayerStateType } from "../state/player.state";
import type { Vector2Type } from "../type/vector2.type";

export const playerRenderQuery = (state: PlayerStateType): Vector2Type => ({
  x: state.position.x,
  y: state.position.y,
});
