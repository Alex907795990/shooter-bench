import type { Vec2 } from "../../_Shared/Data/Vec2";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { WeaponState } from "../Data/WeaponState";
import type { EnemyEntity } from "../../Enemy/Data/EnemyState";
import type { WeaponEvent } from "../Data/WeaponEvents";
import { resolveWeaponResolver } from "../Resolver/WeaponResolver";
import { applyWeaponApplier } from "../Applier/WeaponApplier";
import { dispatchWeaponDispatcher } from "../Dispatcher/WeaponDispatcher";

export function weaponResolveApplyPipeline(
  state: WeaponState,
  playerPos: Readonly<Vec2>,
  enemies: readonly EnemyEntity[],
  tick: TickCommand,
): readonly WeaponEvent[] {
  const events = resolveWeaponResolver(state, playerPos, enemies, tick);
  applyWeaponApplier(state, events);
  return events;
}

export function weaponDispatchPipeline(events: readonly WeaponEvent[]): void {
  dispatchWeaponDispatcher(events);
}
