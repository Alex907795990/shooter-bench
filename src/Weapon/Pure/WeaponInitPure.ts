import type { WeaponState, WeaponEntity } from "../Data/WeaponState";
import { WEAPON_CONFIG } from "../Data/WeaponConfig";

export function createWeaponInitialStatePure(): WeaponState {
  const n = WEAPON_CONFIG.initialWeaponCount;
  const weapons: WeaponEntity[] = [];
  for (let i = 0; i < n; i++) {
    weapons.push({
      id: i + 1,
      orbitAngleRad: (Math.PI * 2 * i) / n,
      cooldownMs: 0,
      intervalMs: WEAPON_CONFIG.intervalMs,
      range: WEAPON_CONFIG.range,
      projectileSpeed: WEAPON_CONFIG.projectileSpeed,
      projectileTtlMs: WEAPON_CONFIG.projectileTtlMs,
      hitRadius: WEAPON_CONFIG.hitRadius,
    });
  }
  return {
    weapons,
    nextWeaponId: n + 1,
    orbitRadius: WEAPON_CONFIG.orbitRadius,
    projectiles: [],
    nextProjectileId: 1,
  };
}
