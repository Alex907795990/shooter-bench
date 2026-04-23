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

export function framePipeline(state: World): void {
  const inputCmds = collectInputCollector();
  const tick = collectTimeCollector();

  const movementEvents = movementResolveApplyPipeline(
    state.movement,
    state.arena,
    inputCmds,
    tick,
  );
  const enemyEvents = enemyResolveApplyPipeline(
    state.enemy,
    state.arena,
    state.movement.player.pos,
    tick,
  );
  const weaponEvents = weaponResolveApplyPipeline(
    state.weapon,
    state.enemy,
    state.movement.player.pos,
    state.enemy.list,
    tick,
  );

  movementDispatchPipeline(movementEvents);
  enemyDispatchPipeline(enemyEvents);
  weaponDispatchPipeline(weaponEvents);
}
