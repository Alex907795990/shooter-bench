export interface WeaponConfig {
  readonly intervalMs: number;
  readonly range: number;
  readonly projectileSpeed: number;
  readonly projectileTtlMs: number;
  readonly hitRadius: number;
  readonly orbitRadius: number;
  readonly initialWeaponCount: number;
}

export const WEAPON_CONFIG: WeaponConfig = {
  intervalMs: 800,
  range: 400,
  projectileSpeed: 600,
  projectileTtlMs: 1500,
  hitRadius: 14,
  orbitRadius: 40,
  initialWeaponCount: 3,
};
