import type { WeaponState } from "../Data/WeaponState";
import type { EnemyState } from "../../Enemy/Data/EnemyState";
import type { WeaponEvent } from "../Data/WeaponEvents";

export function applyWeaponApplier(
  state: WeaponState,
  enemyState: EnemyState,
  events: readonly WeaponEvent[],
): void {
  for (const e of events) {
    switch (e.type) {
      case "weaponMoved": {
        break;
      }
      case "weaponCooldownTicked": {
        const w = state.weapons.find((x) => x.id === e.weaponId);
        if (!w) break;
        w.cooldownMs = e.cooldownMs;
        break;
      }
      case "projectileSpawned": {
        state.projectiles.push({
          id: e.id,
          pos: e.pos,
          vel: e.vel,
          ttlMs: e.ttlMs,
          hitRadius: e.hitRadius,
        });
        state.nextProjectileId = e.id + 1;
        const w = state.weapons.find((x) => x.id === e.weaponId);
        if (w) w.cooldownMs = e.cooldownAfterMs;
        break;
      }
      case "projectileMoved": {
        const p = state.projectiles.find((x) => x.id === e.id);
        if (!p) break;
        p.pos = e.pos;
        p.ttlMs = e.ttlMs;
        break;
      }
      case "projectileExpired": {
        const idx = state.projectiles.findIndex((x) => x.id === e.id);
        if (idx < 0) break;
        state.projectiles.splice(idx, 1);
        break;
      }
      case "projectileHitEnemy": {
        const idx = state.projectiles.findIndex((x) => x.id === e.projectileId);
        if (idx >= 0) state.projectiles.splice(idx, 1);
        enemyState.pendingHits.push(e.enemyId);
        break;
      }
    }
  }
}
