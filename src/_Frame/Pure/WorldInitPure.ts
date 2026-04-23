import type { World } from "../Data/World";
import { createMovementInitialStatePure } from "../../Movement/Pure/MovementInitPure";
import { createEnemyInitialStatePure } from "../../Enemy/Pure/EnemyInitPure";
import { createWeaponInitialStatePure } from "../../Weapon/Pure/WeaponInitPure";

export function createWorldPure(arenaWidth: number, arenaHeight: number): World {
  return {
    arena: { width: arenaWidth, height: arenaHeight },
    movement: createMovementInitialStatePure(arenaWidth, arenaHeight),
    enemy: createEnemyInitialStatePure(arenaWidth, arenaHeight),
    weapon: createWeaponInitialStatePure(),
  };
}
