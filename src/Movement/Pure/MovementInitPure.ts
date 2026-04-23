import type { MovementState } from "../Data/MovementState";
import { MOVEMENT_CONFIG } from "../Data/MovementConfig";

export function createMovementInitialStatePure(
  arenaWidth: number,
  arenaHeight: number,
): MovementState {
  return {
    player: {
      pos: { x: arenaWidth / 2, y: arenaHeight / 2 },
      speed: MOVEMENT_CONFIG.playerSpeed,
    },
  };
}
