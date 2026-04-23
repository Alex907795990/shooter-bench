import type { World } from "./Data/World";
import { collectInputCollector } from "../_Shared/Collector/InputCollector";
import { collectTimeCollector } from "../_Shared/Collector/TimeCollector";
import {
  movementResolveApplyPipeline,
  movementDispatchPipeline,
} from "../Movement/Pipeline/MovementPipeline";
import {
  enemyResolveApplyPipeline,
  enemyDispatchPipeline,
} from "../Enemy/Pipeline/EnemyPipeline";
import {
  weaponResolveApplyPipeline,
  weaponDispatchPipeline,
} from "../Weapon/Pipeline/WeaponPipeline";

export function framePipeline(world: World): void {
  const inputCmds = collectInputCollector();
  const tick = collectTimeCollector();

  const movementEvents = movementResolveApplyPipeline(world, inputCmds, tick);
  const enemyEvents = enemyResolveApplyPipeline(world, tick);
  const weaponEvents = weaponResolveApplyPipeline(world, tick);

  movementDispatchPipeline(movementEvents);
  enemyDispatchPipeline(enemyEvents);
  weaponDispatchPipeline(weaponEvents);
}
