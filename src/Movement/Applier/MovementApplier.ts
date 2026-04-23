import type { MovementState } from "../Data/MovementState";
import type { MovementEvent } from "../Data/MovementEvents";

export function applyMovementApplier(
  state: MovementState,
  events: readonly MovementEvent[],
): void {
  for (const e of events) {
    if (e.type === "playerMoved") {
      state.player.pos = e.pos;
    }
  }
}
