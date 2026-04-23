import type { Vec2 } from "../../_Shared/Data/Vec2";
import type { EnemyState } from "../Data/EnemyState";
import type { ArenaInfo } from "../../_Frame/Data/World";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { EnemyEvent } from "../Data/EnemyEvents";
import { resolveEnemyResolver } from "../Resolver/EnemyResolver";
import { applyEnemyApplier } from "../Applier/EnemyApplier";
import { dispatchEnemyDispatcher } from "../Dispatcher/EnemyDispatcher";

export function enemyResolveApplyPipeline(
  state: EnemyState,
  arena: Readonly<ArenaInfo>,
  playerPos: Readonly<Vec2>,
  weaponHits: readonly number[],
  tick: TickCommand,
): readonly EnemyEvent[] {
  const events = resolveEnemyResolver(state, arena, playerPos, weaponHits, tick);
  applyEnemyApplier(state, events);
  return events;
}

export function enemyDispatchPipeline(events: readonly EnemyEvent[]): void {
  dispatchEnemyDispatcher(events);
}
