import type { Vec2 } from "../../_Shared/Data/Vec2";
import type { TickCommand } from "../../_Shared/Data/TickCommand";
import type { WeaponState, WeaponEntity } from "../Data/WeaponState";
import type { EnemyEntity } from "../../Enemy/Data/EnemyState";
import type { WeaponEvent } from "../Data/WeaponEvents";

export function resolveWeaponResolver(
  state: Readonly<WeaponState>,
  playerPos: Readonly<Vec2>,
  enemies: readonly EnemyEntity[],
  tick: TickCommand,
): readonly WeaponEvent[] {
  const events: WeaponEvent[] = [];
  const dt = tick.deltaMs;
  const dts = dt / 1000;

  for (const p of state.projectiles) {
    const nx = p.pos.x + p.vel.x * dts;
    const ny = p.pos.y + p.vel.y * dts;
    const newTtl = p.ttlMs - dt;

    let hitId: number | null = null;
    for (const e of enemies) {
      const ddx = e.pos.x - nx;
      const ddy = e.pos.y - ny;
      if (ddx * ddx + ddy * ddy <= p.hitRadius * p.hitRadius) {
        hitId = e.id;
        break;
      }
    }
    if (hitId !== null) {
      events.push({ type: "projectileHitEnemy", projectileId: p.id, enemyId: hitId });
      continue;
    }
    if (newTtl <= 0) {
      events.push({ type: "projectileExpired", id: p.id });
      continue;
    }
    events.push({ type: "projectileMoved", id: p.id, pos: { x: nx, y: ny }, ttlMs: newTtl });
  }

  const killedFromHits = new Set<number>();
  for (const ev of events) {
    if (ev.type === "projectileHitEnemy") killedFromHits.add(ev.enemyId);
  }

  let nextProjectileId = state.nextProjectileId;
  const claimedTargets = new Set<number>(killedFromHits);

  for (const w of state.weapons) {
    const weaponPos: Vec2 = {
      x: playerPos.x + Math.cos(w.orbitAngleRad) * state.orbitRadius,
      y: playerPos.y + Math.sin(w.orbitAngleRad) * state.orbitRadius,
    };
    events.push({ type: "weaponMoved", weaponId: w.id, pos: weaponPos });

    const newCd = Math.max(0, w.cooldownMs - dt);
    if (newCd <= 0) {
      const target = pickNearestEnemy(enemies, weaponPos, w.range, claimedTargets);
      if (target) {
        const dx = target.pos.x - weaponPos.x;
        const dy = target.pos.y - weaponPos.y;
        const len = Math.hypot(dx, dy) || 1;
        const vel: Vec2 = {
          x: (dx / len) * w.projectileSpeed,
          y: (dy / len) * w.projectileSpeed,
        };
        events.push({
          type: "projectileSpawned",
          weaponId: w.id,
          id: nextProjectileId,
          pos: { ...weaponPos },
          vel,
          ttlMs: w.projectileTtlMs,
          hitRadius: w.hitRadius,
          cooldownAfterMs: w.intervalMs,
        });
        nextProjectileId += 1;
      } else {
        events.push({ type: "weaponCooldownTicked", weaponId: w.id, cooldownMs: 0 });
      }
    } else {
      events.push({ type: "weaponCooldownTicked", weaponId: w.id, cooldownMs: newCd });
    }
  }

  return events;
}

function pickNearestEnemy(
  enemies: readonly EnemyEntity[],
  from: Vec2,
  maxRange: number,
  exclude: ReadonlySet<number>,
): EnemyEntity | null {
  let best: EnemyEntity | null = null;
  let bestD2 = maxRange * maxRange;
  for (const e of enemies) {
    if (exclude.has(e.id)) continue;
    const dx = e.pos.x - from.x;
    const dy = e.pos.y - from.y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= bestD2) {
      bestD2 = d2;
      best = e;
    }
  }
  return best;
}
