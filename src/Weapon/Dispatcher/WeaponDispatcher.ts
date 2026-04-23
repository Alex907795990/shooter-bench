import type { WeaponEvent } from "../Data/WeaponEvents";
import {
  ensureProjectileSpriteAdapter,
  setProjectilePositionAdapter,
  destroyProjectileSpriteAdapter,
} from "../Adapter/ProjectileSpriteAdapter";
import {
  ensureWeaponSpriteAdapter,
  setWeaponPositionAdapter,
} from "../Adapter/WeaponSpriteAdapter";

export function dispatchWeaponDispatcher(events: readonly WeaponEvent[]): void {
  for (const e of events) {
    switch (e.type) {
      case "weaponMoved":
        ensureWeaponSpriteAdapter(e.weaponId, e.pos);
        setWeaponPositionAdapter(e.weaponId, e.pos);
        break;
      case "projectileSpawned":
        ensureProjectileSpriteAdapter(e.id, e.pos);
        break;
      case "projectileMoved":
        setProjectilePositionAdapter(e.id, e.pos);
        break;
      case "projectileExpired":
        destroyProjectileSpriteAdapter(e.id);
        break;
      case "projectileHitEnemy":
        destroyProjectileSpriteAdapter(e.projectileId);
        break;
      case "weaponCooldownTicked":
        break;
    }
  }
}
