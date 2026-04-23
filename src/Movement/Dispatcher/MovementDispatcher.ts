import type { MovementEvent } from "../Data/MovementEvents";
import { setPlayerPositionAdapter } from "../Adapter/PlayerSpriteAdapter";

export function dispatchMovementDispatcher(events: readonly MovementEvent[]): void {
  for (const e of events) {
    if (e.type === "playerMoved") {
      setPlayerPositionAdapter(e.pos);
    }
  }
}
