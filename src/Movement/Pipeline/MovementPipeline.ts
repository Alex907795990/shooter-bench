import type { ArenaInfo } from "../../_Frame/Data/World";
import type { MovementState } from "../Data/MovementState";
import type { InputCommand } from "../../_Shared/Data/InputCommand";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { MovementEvent } from "../Data/MovementEvents";
import { resolveMovementResolver } from "../Resolver/MovementResolver";
import { applyMovementApplier } from "../Applier/MovementApplier";
import { dispatchMovementDispatcher } from "../Dispatcher/MovementDispatcher";

export function movementResolveApplyPipeline(
  state: MovementState,
  arena: Readonly<ArenaInfo>,
  inputCmds: readonly InputCommand[],
  tick: TickCommand,
): readonly MovementEvent[] {
  const events = resolveMovementResolver(state, arena, inputCmds, tick);
  applyMovementApplier(state, events);
  return events;
}

export function movementDispatchPipeline(events: readonly MovementEvent[]): void {
  dispatchMovementDispatcher(events);
}
