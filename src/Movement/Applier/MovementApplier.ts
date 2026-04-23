import type { World } from "../../_Frame/Data/World";
import type { MovementEvent } from "../Data/MovementEvents";

export function applyMovementApplier(
  world: World,
  events: readonly MovementEvent[],
): void {
  for (const e of events) {
    if (e.type === "playerMoved") {
      world.movement.player.pos = e.pos;
    }
  }
}
