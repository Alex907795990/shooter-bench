import type { ArenaInfo } from "../../_Frame/Data/World";
import type { MovementState } from "../Data/MovementState";
import type { InputCommand } from "../../_Shared/Data/InputCommand";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { MovementEvent } from "../Data/MovementEvents";

export function resolveMovementResolver(
  state: Readonly<MovementState>,
  arena: Readonly<ArenaInfo>,
  inputCmds: readonly InputCommand[],
  tick: TickCommand,
): readonly MovementEvent[] {
  const move = inputCmds.find((c) => c.type === "moveInput");
  if (!move) return [];
  const dt = tick.deltaMs / 1000;
  const { player } = state;
  const nx = clamp(player.pos.x + move.dir.x * player.speed * dt, 0, arena.width);
  const ny = clamp(player.pos.y + move.dir.y * player.speed * dt, 0, arena.height);
  return [{ type: "playerMoved", pos: { x: nx, y: ny } }];
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
