import type { World } from "../../_Frame/Data/World";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { WeaponEvent } from "../Data/WeaponEvents";
import { resolveWeaponResolver } from "../Resolver/WeaponResolver";
import { applyWeaponApplier } from "../Applier/WeaponApplier";
import { dispatchWeaponDispatcher } from "../Dispatcher/WeaponDispatcher";

export function weaponResolveApplyPipeline(
  world: World,
  tick: TickCommand,
): readonly WeaponEvent[] {
  const events = resolveWeaponResolver(world, tick);
  applyWeaponApplier(world, events);
  return events;
}

export function weaponDispatchPipeline(events: readonly WeaponEvent[]): void {
  dispatchWeaponDispatcher(events);
}
