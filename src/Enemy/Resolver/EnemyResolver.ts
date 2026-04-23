// 形态破例：本 Resolver 调用 Math.random（已与用户确认）。
// 影响：Resolver 不再是纯函数，无法回放/单测断言确定输出。
import type { Vec2 } from "../../_Shared/Data/Vec2";
import type { World } from "../../_Frame/Data/World";
import type { ArenaInfo } from "../../_Frame/Data/World";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { EnemyEvent } from "../Data/EnemyEvents";
import { ENEMY_CONFIG } from "../Data/EnemyConfig";

export function resolveEnemyResolver(
  world: Readonly<World>,
  tick: TickCommand,
): readonly EnemyEvent[] {
  const events: EnemyEvent[] = [];
  const dt = tick.deltaMs;
  const dts = dt / 1000;

  const state = world.enemy;
  const arena = world.arena;
  const playerPos = world.movement.player.pos;
  // 跨域 1 帧延迟：上一帧 Weapon 写入的命中 id，本帧 Enemy 读取并转 enemyDied
  const weaponHits = world.weapon.recentEnemyHits;

  const liveSet = new Set(state.list.map((e) => e.id));
  const dyingSet = new Set<number>();
  for (const id of weaponHits) {
    if (!liveSet.has(id) || dyingSet.has(id)) continue;
    events.push({ type: "enemyDied", id });
    dyingSet.add(id);
  }

  for (const e of state.list) {
    if (dyingSet.has(e.id)) continue;
    const dx = playerPos.x - e.pos.x;
    const dy = playerPos.y - e.pos.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) continue;
    const nx = e.pos.x + (dx / len) * e.speed * dts;
    const ny = e.pos.y + (dy / len) * e.speed * dts;
    events.push({ type: "enemyMoved", id: e.id, pos: { x: nx, y: ny } });
  }

  let nextEnemyId = state.nextId;
  let liveCount = state.list.length - dyingSet.size;

  for (const ps of state.pendingSpawns) {
    const newRemain = ps.remainMs - dt;
    if (newRemain > 0) {
      events.push({ type: "enemySpawnMarkerTicked", id: ps.id, remainMs: newRemain });
      continue;
    }
    events.push({ type: "enemySpawnMarkerExpired", id: ps.id });
    if (liveCount >= ENEMY_CONFIG.maxConcurrent) continue;
    events.push({
      type: "enemySpawned",
      enemyId: nextEnemyId,
      pos: ps.pos,
      speed: ENEMY_CONFIG.defaultSpeed,
    });
    nextEnemyId += 1;
    liveCount += 1;
  }

  const newCd = state.spawnCooldownMs - dt;
  if (newCd > 0) {
    events.push({ type: "enemySpawnCooldownTicked", cooldownMs: newCd });
  } else {
    let nextMarkerId = state.nextMarkerId;
    for (let i = 0; i < ENEMY_CONFIG.batchSize; i++) {
      const pos = rollSpawnPos(arena, playerPos, ENEMY_CONFIG.minDistanceFromPlayer);
      if (!pos) continue;
      events.push({
        type: "enemySpawnMarkerCreated",
        id: nextMarkerId,
        pos,
        remainMs: ENEMY_CONFIG.spawnDelayMs,
      });
      nextMarkerId += 1;
    }
    events.push({ type: "enemySpawnCooldownTicked", cooldownMs: ENEMY_CONFIG.batchIntervalMs });
  }

  return events;
}

function rollSpawnPos(
  arena: Readonly<ArenaInfo>,
  playerPos: Readonly<Vec2>,
  minDistance: number,
): Vec2 | null {
  const minD2 = minDistance * minDistance;
  for (let attempt = 0; attempt < 8; attempt++) {
    const x = Math.random() * arena.width;
    const y = Math.random() * arena.height;
    const dx = x - playerPos.x;
    const dy = y - playerPos.y;
    if (dx * dx + dy * dy >= minD2) return { x, y };
  }
  return null;
}
