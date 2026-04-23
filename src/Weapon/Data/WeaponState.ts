import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface WeaponEntity {
  id: number;
  orbitAngleRad: number;
  cooldownMs: number;
  intervalMs: number;
  range: number;
  projectileSpeed: number;
  projectileTtlMs: number;
  hitRadius: number;
}

export interface ProjectileEntity {
  id: number;
  pos: Vec2;
  vel: Vec2;
  ttlMs: number;
  hitRadius: number;
}

export interface WeaponState {
  weapons: WeaponEntity[];
  nextWeaponId: number;
  orbitRadius: number;
  projectiles: ProjectileEntity[];
  nextProjectileId: number;
  // 跨领域信号：本帧 Weapon 命中的敌人 id；下一帧 Enemy 读取后 Weapon 帧首清空
  recentEnemyHits: number[];
}
