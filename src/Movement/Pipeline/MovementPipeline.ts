import type { World } from "../../_Frame/Data/World";
import type { InputCommand } from "../../_Shared/Data/InputCommand";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { MovementEvent } from "../Data/MovementEvents";
import { resolveMovementResolver } from "../Resolver/MovementResolver";
import { applyMovementApplier } from "../Applier/MovementApplier";
import { dispatchMovementDispatcher } from "../Dispatcher/MovementDispatcher";

export function movementResolveApplyPipeline(
  world: World,
  inputCmds: readonly InputCommand[],
  tick: TickCommand,
): readonly MovementEvent[] {
  const events = resolveMovementResolver(world, inputCmds, tick);
  applyMovementApplier(world, events);
  return events;
}

export function movementDispatchPipeline(events: readonly MovementEvent[]): void {
  dispatchMovementDispatcher(events);
}
