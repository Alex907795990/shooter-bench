import type { World } from "../../_Frame/Data/World";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { EnemyEvent } from "../Data/EnemyEvents";
import { resolveEnemyResolver } from "../Resolver/EnemyResolver";
import { applyEnemyApplier } from "../Applier/EnemyApplier";
import { dispatchEnemyDispatcher } from "../Dispatcher/EnemyDispatcher";

export function enemyResolveApplyPipeline(
  world: World,
  tick: TickCommand,
): readonly EnemyEvent[] {
  const events = resolveEnemyResolver(world, tick);
  applyEnemyApplier(world, events);
  return events;
}

export function enemyDispatchPipeline(events: readonly EnemyEvent[]): void {
  dispatchEnemyDispatcher(events);
}
