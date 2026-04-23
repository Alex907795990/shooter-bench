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
  // 跨领域 1 帧延迟：上一帧 Weapon 命中的敌人 id，本帧 Enemy 转 enemyDied
  const weaponHits = state.weapon.recentEnemyHits.slice();
  const enemyEvents = enemyResolveApplyPipeline(
    state.enemy,
    state.arena,
    state.movement.player.pos,
    weaponHits,
    tick,
  );
  const weaponEvents = weaponResolveApplyPipeline(
    state.weapon,
    state.movement.player.pos,
    state.enemy.list,
    tick,
  );

  movementDispatchPipeline(movementEvents);
  enemyDispatchPipeline(enemyEvents);
  weaponDispatchPipeline(weaponEvents);
}
