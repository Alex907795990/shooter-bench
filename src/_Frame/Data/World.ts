import type { MovementState } from "../../Movement/Data/MovementState";
import type { EnemyState } from "../../Enemy/Data/EnemyState";
import type { WeaponState } from "../../Weapon/Data/WeaponState";

export interface ArenaInfo {
  width: number;
  height: number;
}

export interface World {
  arena: ArenaInfo;
  movement: MovementState;
  enemy: EnemyState;
  weapon: WeaponState;
}
